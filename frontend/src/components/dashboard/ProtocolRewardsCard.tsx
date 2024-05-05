import NextLink from "next/link";
import React, { useState } from "react";

import BigNumber from "bignumber.js";
import { toast } from "sonner";

import Card from "@/components/dashboard/Card";
import PointsCount from "@/components/points/PointsCount";
import PointsRank from "@/components/points/PointsRank";
import Button from "@/components/shared/Button";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import TokenIcon from "@/components/shared/TokenIcon";
import Tooltip from "@/components/shared/Tooltip";
import {
  TBody,
  TLabel,
  TLabelSans,
  TTitle,
} from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { usePointsContext } from "@/contexts/PointsContext";
import { useWalletContext } from "@/contexts/WalletContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import { LOGO_MAP, NORMALIZED_SUI_COINTYPE, isSui } from "@/lib/coinType";
import { TX_TOAST_DURATION } from "@/lib/constants";
import { formatToken } from "@/lib/format";
import { RewardSummary, getFilteredRewards } from "@/lib/liquidityMining";
import { POINTS_URL } from "@/lib/navigation";
import { getPointsStats } from "@/lib/points";
import { cn } from "@/lib/utils";

interface PendingRewardsProps {
  totalSuiRewards: BigNumber;
  isCentered?: boolean;
}

function PendingRewards({ totalSuiRewards, isCentered }: PendingRewardsProps) {
  return (
    <div className={cn("flex flex-col gap-1", isCentered && "items-center")}>
      <TLabel className="uppercase">Pending rewards</TLabel>
      <div className="flex flex-row items-center gap-1.5">
        <TokenIcon
          className="h-4 w-4"
          coinType={NORMALIZED_SUI_COINTYPE}
          symbol="SUI"
          url={LOGO_MAP[NORMALIZED_SUI_COINTYPE]}
        />
        <Tooltip title={formatToken(totalSuiRewards, { dp: 9 })}>
          <TBody>{formatToken(totalSuiRewards)}</TBody>
        </Tooltip>
      </div>
    </div>
  );
}

interface TotalPointsStatProps {
  totalPoints: BigNumber;
  isCentered?: boolean;
}

function TotalPointsStat({ totalPoints, isCentered }: TotalPointsStatProps) {
  return (
    <div className={cn("flex flex-col gap-1", isCentered && "items-center")}>
      <TLabel className={cn("uppercase", isCentered && "text-center")}>
        Total points
      </TLabel>
      <PointsCount points={totalPoints} />
    </div>
  );
}

interface PointsPerDayStatProps {
  pointsPerDay: BigNumber;
  isCentered?: boolean;
}

function PointsPerDayStat({ pointsPerDay, isCentered }: PointsPerDayStatProps) {
  return (
    <div className={cn("flex flex-col gap-1", isCentered && "items-center")}>
      <TLabel className={cn("uppercase", isCentered && "text-center")}>
        Points per day
      </TLabel>
      <PointsCount points={pointsPerDay} />
    </div>
  );
}

interface RankStatProps {
  rank?: number | null;
  isCentered?: boolean;
}

function RankStat({ rank, isCentered }: RankStatProps) {
  return (
    <div className={cn("flex flex-col gap-1", isCentered && "items-center")}>
      <TLabel className={cn("uppercase", isCentered && "text-center")}>
        Rank
      </TLabel>
      <PointsRank rank={rank} isCentered={isCentered} />
    </div>
  );
}

export default function ProtocolRewardsCard() {
  const { setIsConnectWalletDropdownOpen, address, isImpersonatingAddress } =
    useWalletContext();
  const { refreshData, explorer, obligation, ...restAppContext } =
    useAppContext();
  const data = restAppContext.data as AppData;
  const { rank } = usePointsContext();
  const { claimRewards } = useDashboardContext();

  const { md } = useBreakpoint();

  // Rewards
  let totalSuiRewards = new BigNumber(0);
  let suiRewards: RewardSummary[] = [];
  if (obligation) {
    suiRewards = getFilteredRewards(
      Object.values(data.rewardMap).flatMap((rewards) =>
        [...rewards.deposit, ...rewards.borrow].filter(
          (r) =>
            isSui(r.stats.rewardCoinType) && r.obligationClaims[obligation.id],
        ),
      ),
    );

    suiRewards.forEach((reward) => {
      totalSuiRewards = totalSuiRewards.plus(
        reward.obligationClaims[obligation.id].claimableAmount,
      );
    });
  }

  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const onClaimRewardsClick = async () => {
    if (isClaiming) return;

    setIsClaiming(true);

    try {
      const res = await claimRewards(suiRewards);
      const txUrl = explorer.buildTxUrl(res.digest);

      toast.success("Claimed rewards", {
        action: <TextLink href={txUrl}>View tx on {explorer.name}</TextLink>,
        duration: TX_TOAST_DURATION,
      });
    } catch (err) {
      toast.error("Failed to claim rewards", {
        description: ((err as Error)?.message || err) as string,
        duration: TX_TOAST_DURATION,
      });
    } finally {
      setIsClaiming(false);
      await refreshData();
    }
  };

  // Points
  const pointsStats = getPointsStats(data.rewardMap, data.obligations);

  return !address ? (
    <Card className="bg-background">
      <div
        className="flex h-[100px] flex-col items-center justify-center gap-4 sm:h-[110px]"
        style={{
          backgroundImage:
            "url('/assets/dashboard/protocol-rewards-not-connected.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <TTitle className="text-center uppercase text-primary-foreground sm:text-[16px]">
          Start earning points & rewards
        </TTitle>

        <Button
          labelClassName="uppercase"
          variant="outline"
          onClick={() => setIsConnectWalletDropdownOpen(true)}
        >
          Connect wallet
        </Button>
      </div>
    </Card>
  ) : (
    <Card className="rounded-[4px] border-none bg-gradient-to-r from-secondary to-border p-[1px]">
      <div
        className="rounded-[3px] bg-background p-4"
        style={{
          backgroundImage:
            "url('/assets/dashboard/protocol-rewards-connected.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <TTitle className="uppercase text-primary-foreground">
                Protocol rewards
              </TTitle>
              <TLabelSans>
                Boost your earnings with bonus Suilend rewards.
              </TLabelSans>
            </div>

            <div className="flex flex-row gap-2">
              <div className="flex-1 sm:flex-initial">
                <NextLink href={POINTS_URL}>
                  <Button
                    className="w-full border-secondary text-primary-foreground"
                    labelClassName="uppercase"
                    variant="secondaryOutline"
                  >
                    Points hub
                  </Button>
                </NextLink>
              </div>

              <div className="flex-1 sm:flex-initial">
                <Button
                  className="w-full sm:w-[134px]"
                  labelClassName="uppercase"
                  disabled={totalSuiRewards.eq(0) || isImpersonatingAddress}
                  onClick={onClaimRewardsClick}
                >
                  {isClaiming ? <Spinner size="sm" /> : "Claim rewards"}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {md ? (
            <div className="flex flex-row items-center justify-between gap-4">
              <PendingRewards totalSuiRewards={totalSuiRewards} />
              <TotalPointsStat totalPoints={pointsStats.totalPoints.total} />
              <PointsPerDayStat pointsPerDay={pointsStats.pointsPerDay.total} />
              <RankStat rank={rank} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <PendingRewards totalSuiRewards={totalSuiRewards} isCentered />
              <TotalPointsStat
                totalPoints={pointsStats.totalPoints.total}
                isCentered
              />

              <PointsPerDayStat
                pointsPerDay={pointsStats.pointsPerDay.total}
                isCentered
              />
              <RankStat rank={rank} isCentered />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
