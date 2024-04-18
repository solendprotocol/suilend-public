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
import TitleChip from "@/components/shared/TitleChip";
import TokenIcon from "@/components/shared/TokenIcon";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TBodySans, TLabel } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { useWalletContext } from "@/contexts/WalletContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import { LOGO_MAP, NORMALIZED_SUI_COINTYPE, isSui } from "@/lib/coinType";
import { TX_TOAST_DURATION } from "@/lib/constants";
import { formatToken } from "@/lib/format";
import { POINTS_URL } from "@/lib/navigation";
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

interface Season1PointsStatProps {
  points: BigNumber;
  isCentered?: boolean;
}

function Season1PointsStat({ points, isCentered }: Season1PointsStatProps) {
  return (
    <div className={cn("flex flex-col gap-1", isCentered && "items-center")}>
      <TLabel className={cn("uppercase", isCentered && "text-center")}>
        Season 1 points
      </TLabel>
      <PointsCount points={points} />
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
  rank: number;
  isCentered?: boolean;
}

function RankStat({ rank, isCentered }: RankStatProps) {
  return (
    <div className={cn("flex flex-col gap-1", isCentered && "items-center")}>
      <TLabel className={cn("uppercase", isCentered && "text-center")}>
        Rank
      </TLabel>
      <PointsRank rank={rank} />
    </div>
  );
}

export default function RewardsCard() {
  const { setIsConnectWalletDropdownOpen, address, isImpersonatingAddress } =
    useWalletContext();
  const { refreshData, explorer, obligation, ...restAppContext } =
    useAppContext();
  const data = restAppContext.data as AppData;

  const { md } = useBreakpoint();

  // Rewards
  let totalSuiRewards = new BigNumber(0);
  const suiRewards = Object.values(data.rewardMap).flatMap((rewards) => {
    return [...rewards.deposit, ...rewards.borrow].filter(
      (r) =>
        isSui(r.stats.rewardCoinType) &&
        obligation &&
        r.obligationClaims[obligation.id],
    );
  });

  if (obligation?.id) {
    suiRewards.forEach((reward) => {
      totalSuiRewards = totalSuiRewards.plus(
        reward.obligationClaims[obligation.id]?.claimableAmount ??
          new BigNumber(0),
      );
    });
  }

  // Points
  const totalPoints = data.pointsStats.totalPoints.total;
  const pointsPerDay = data.pointsStats.pointsPerDay.total;
  const rank = 3;

  // Claim
  const { claimRewards } = useDashboardContext();

  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const onClaimRewardsClick = async () => {
    if (isClaiming) return;

    setIsClaiming(true);

    try {
      const res = await claimRewards(suiRewards);
      const txUrl = explorer.buildTxUrl(res.digest);

      toast.success(
        <TBodySans>
          {"Claimed rewards. "}
          <TextLink href={txUrl}>View transaction</TextLink>
        </TBodySans>,
        { duration: TX_TOAST_DURATION },
      );
    } catch (err) {
      toast.error(
        `Failed to claim rewards: ${(err as Error)?.message || err}`,
        { duration: TX_TOAST_DURATION },
      );
    } finally {
      setIsClaiming(false);
      await refreshData();
    }
  };

  return (
    <Card className="bg-background">
      {!address ? (
        <div
          className="flex h-[100px] flex-col items-center justify-center gap-4 sm:h-[110px]"
          style={{
            backgroundImage: "url('/assets/points-splash.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="text-center font-mono text-sm font-normal uppercase text-primary-foreground sm:text-[16px]">
            Start earning points & rewards
          </div>

          <Button
            labelClassName="uppercase"
            variant="outline"
            onClick={() => setIsConnectWalletDropdownOpen(true)}
          >
            Connect wallet
          </Button>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <TitleChip>Protocol rewards</TitleChip>
              <TBodySans>
                Boost your earnings with bonus Suilend rewards.
              </TBodySans>
            </div>

            <Separator />

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-10">
              {md ? (
                <div className="flex flex-1 flex-row items-center justify-between gap-4">
                  <PendingRewards totalSuiRewards={totalSuiRewards} />
                  <Season1PointsStat points={totalPoints} />
                  <PointsPerDayStat pointsPerDay={pointsPerDay} />
                  <RankStat rank={rank} />
                </div>
              ) : (
                <div className="grid flex-1 grid-cols-2 gap-4">
                  <PendingRewards
                    totalSuiRewards={totalSuiRewards}
                    isCentered
                  />
                  <Season1PointsStat points={totalPoints} isCentered />

                  <PointsPerDayStat pointsPerDay={pointsPerDay} isCentered />
                  <RankStat rank={rank} isCentered />
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row md:w-max md:flex-col">
                <div className="w-full sm:w-auto sm:flex-1 md:flex-auto">
                  <NextLink href={POINTS_URL} className="h-7 w-full">
                    <Button
                      className="h-7 w-full"
                      labelClassName="uppercase text-xs"
                    >
                      Points hub
                    </Button>
                  </NextLink>
                </div>

                <div className="w-full sm:w-auto sm:flex-1 md:flex-auto">
                  <Button
                    className="h-7 w-full border-secondary text-primary-foreground"
                    labelClassName="uppercase text-xs"
                    variant="secondaryOutline"
                    disabled={totalSuiRewards.eq(0) || isImpersonatingAddress}
                    onClick={onClaimRewardsClick}
                  >
                    {isClaiming ? <Spinner size="sm" /> : "Claim rewards"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
