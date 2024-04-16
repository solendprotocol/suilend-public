import React, { useState } from "react";

import BigNumber from "bignumber.js";
import { toast } from "sonner";

import Button from "@/components/shared/Button";
import Chip from "@/components/shared/Chip";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import TokenIcon from "@/components/shared/TokenIcon";
import Tooltip from "@/components/shared/Tooltip";
import {
  TBodySans,
  TDisplay,
  TLabel,
  TLabelSans,
} from "@/components/shared/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { LOGO_MAP, NORMALIZED_SUI_COINTYPE, isSui } from "@/lib/coinType";
import { TX_TOAST_DURATION } from "@/lib/constants";
import { formatToken } from "@/lib/format";

export default function LiquidityMiningCard() {
  const { address, isImpersonatingAddress } = useWalletContext();
  const { refreshData, explorer, obligation, ...restAppContext } =
    useAppContext();

  const data = restAppContext.data as AppData;

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
    <div className="w-full rounded-[4px] bg-card bg-gradient-to-b from-secondary to-70% p-[1px] lg:rounded-[16px]">
      <Card className="relative w-full overflow-hidden rounded-[3px] border-none lg:rounded-[15px]">
        {/* Radial blurs */}
        <div className="absolute h-full w-full bg-[radial-gradient(128.40%_69.55%_at_80.76%_32.29%,rgba(205,154,255,0.1)_0%,rgba(255,255,255,0.00)_100%)]" />
        <div className="absolute h-full w-full bg-[radial-gradient(38.40%_69.55%_at_50.76%_72.29%,rgba(205,154,255,0.08)_0%,rgba(255,255,255,0.00)_100%)]" />

        <CardContent className="relative p-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-start justify-between">
              <TokenIcon
                className="h-12 w-12"
                coinType={NORMALIZED_SUI_COINTYPE}
                symbol="SUI"
                url={LOGO_MAP[NORMALIZED_SUI_COINTYPE]}
              />

              <Chip>Protocol rewards</Chip>
            </div>

            <div className="flex flex-row justify-between gap-2">
              <div className="flex flex-col gap-1">
                <Tooltip
                  title={`${formatToken(totalSuiRewards, { dp: 9 })} SUI`}
                >
                  <TDisplay className="leading-5">
                    {formatToken(totalSuiRewards)} SUI
                  </TDisplay>
                </Tooltip>
                <TLabel className="uppercase text-primary">
                  Claimable rewards
                </TLabel>
              </div>

              {address && (
                <Button
                  className="w-[142px] uppercase"
                  disabled={totalSuiRewards.eq(0) || isImpersonatingAddress}
                  onClick={onClaimRewardsClick}
                >
                  {isClaiming ? <Spinner size="sm" /> : "Claim rewards"}
                </Button>
              )}
            </div>

            <Separator />

            <TLabelSans>
              Boost your earnings with bonus Suilend rewards.
            </TLabelSans>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
