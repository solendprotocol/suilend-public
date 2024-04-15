import BigNumber from "bignumber.js";
import { capitalize } from "lodash";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import RewardChip from "@/components/dashboard/RewardChip";
import TokenIcon from "@/components/shared/TokenIcon";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabel, TTitle } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { formatPercent, formatToken } from "@/lib/format";
import {
  RewardSummary,
  getDedupedAprRewards,
  getDedupedDailyRewards,
  getFilteredRewards,
  getTotalAprPercent,
} from "@/lib/liquidityMining";
import { cn, hoverUnderlineClassName } from "@/lib/utils";

function calculateUtilizationRate(reserve: ParsedReserve) {
  // Units are decimal
  const totalSupplyExcludingFees = reserve.availableAmount.plus(
    reserve.borrowedAmount,
  );
  if (totalSupplyExcludingFees.isZero()) {
    return new BigNumber(0);
  }
  return reserve.borrowedAmount.div(totalSupplyExcludingFees);
}

function calculateBorrowAprPercent(reserve: ParsedReserve) {
  const config = reserve.config;
  const length = config.interestRate.length;
  const currentUtil = calculateUtilizationRate(reserve);
  let i = 1;
  while (i < length) {
    const leftUtil = config.interestRate[i - 1].utilPercent.div(100);
    const rightUtil = config.interestRate[i].utilPercent.div(100);
    if (currentUtil >= leftUtil && currentUtil <= rightUtil) {
      const leftAprPercent = config.interestRate[i - 1].aprPercent;
      const rightAprPercent = config.interestRate[i].aprPercent;
      const weight = currentUtil.minus(leftUtil).div(rightUtil.minus(leftUtil));
      const aprPercentDiff = rightAprPercent.minus(leftAprPercent);

      return new BigNumber(
        leftAprPercent.plus(
          new BigNumber(weight).times(new BigNumber(aprPercentDiff)),
        ),
      );
    }
    i = i + 1;
  }
  // Should never reach here
  return new BigNumber(0);
}

function calculateDepositAprPercent(reserve: ParsedReserve) {
  const borrowAprPercent = calculateBorrowAprPercent(reserve);
  const currentUtil = calculateUtilizationRate(reserve);
  const protocolTakePercentage = new BigNumber(1).minus(
    new BigNumber(reserve.config.spreadFeeBps?.toString() || 0).div(10000),
  );

  return currentUtil.times(borrowAprPercent).times(protocolTakePercentage);
}

interface AprWithRewardsBreakdownProps {
  side: Side;
  aprPercent: BigNumber;
  rewards: RewardSummary[];
  reserve?: ParsedReserve;
  amountChange?: BigNumber;
}

export default function AprWithRewardsBreakdown({
  side,
  aprPercent,
  rewards,
  reserve,
  amountChange,
}: AprWithRewardsBreakdownProps) {
  const filteredRewards = getFilteredRewards(rewards);

  // This logic shows APR for the pool after an action. This assumes
  // the reward and interest is distributed proportionally to the pool.
  // Change this logic if this assumption changes.
  let newAprPercent = aprPercent;
  let aprModifier = new BigNumber(1);
  if (reserve && amountChange) {
    const delta =
      side === Side.DEPOSIT
        ? {
            availableAmount: BigNumber.max(
              reserve.availableAmount.plus(amountChange),
              "0",
            ),
          }
        : {
            borrowedAmount: BigNumber.max(
              reserve.borrowedAmount.plus(amountChange),
              "0",
            ),
          };

    const modifiedReserve = {
      ...reserve,
      ...delta,
    };
    newAprPercent =
      side === Side.DEPOSIT
        ? calculateDepositAprPercent(modifiedReserve)
        : calculateBorrowAprPercent(modifiedReserve);
    const poolTotal =
      side === Side.DEPOSIT ? reserve.totalDeposits : reserve.borrowedAmount;
    aprModifier = amountChange.plus(poolTotal).isZero()
      ? new BigNumber(-1)
      : poolTotal.div(amountChange.plus(poolTotal));
  }

  const invalidAprModifier = aprModifier.isNegative();

  // APR
  const dedupedAprRewards = getDedupedAprRewards(filteredRewards);
  const dedupedNewAprRewards = dedupedAprRewards.map((r) => ({
    ...r,
    aprPercent: r.stats.aprPercent.times(aprModifier),
  }));

  // Total APR
  const totalAprPercent = getTotalAprPercent(aprPercent, filteredRewards);

  const newTotalAprPercent = newAprPercent.plus(
    dedupedNewAprRewards.reduce(
      (acc, reward) => acc.plus(reward.aprPercent),
      new BigNumber(0),
    ),
  );

  // Daily
  const dedupedDailyRewards = getDedupedDailyRewards(filteredRewards);
  const dedupedNewDailyRewards = dedupedDailyRewards.map((r) => ({
    ...r,
    dailyReward: r.stats.dailyReward.times(aprModifier),
  }));

  if (filteredRewards.length === 0)
    return (
      <TBody>
        {amountChange
          ? `${formatPercent(totalAprPercent)} -> ${invalidAprModifier ? "N/A" : formatPercent(newTotalAprPercent)}`
          : formatPercent(totalAprPercent)}
      </TBody>
    );
  return (
    <div>
      <Tooltip
        contentProps={{
          className: "rounded-md px-4 py-4 flex-col flex gap-4 min-w-[300px]",
          style: { maxWidth: "none" },
        }}
        content={
          <>
            <div className="flex flex-row items-center justify-between gap-6">
              <TLabel className="uppercase">{capitalize(side)} APR</TLabel>
              <TBody>
                {amountChange
                  ? `${formatPercent(aprPercent)} → ${formatPercent(newAprPercent)}`
                  : formatPercent(aprPercent)}
              </TBody>
            </div>

            <div className="flex flex-col gap-3">
              {dedupedAprRewards.map((reward, index) => (
                <div
                  key={reward.stats.id}
                  className="flex flex-row items-center justify-between gap-6"
                >
                  <RewardChip symbol={reward.stats.rewardSymbol} hasPlus />

                  <div className="flex flex-row items-center gap-2">
                    <TokenIcon
                      className="h-6 w-6"
                      coinType={reward.stats.rewardCoinType}
                      symbol={reward.stats.rewardSymbol}
                      url={reward.stats.iconUrl}
                    />
                    <TBody className="text-primary-foreground">
                      {amountChange
                        ? `${formatPercent(reward.stats.aprPercent)} → ${invalidAprModifier ? "N/A" : formatPercent(dedupedNewAprRewards[index].aprPercent)}`
                        : formatPercent(reward.stats.aprPercent)}
                    </TBody>
                  </div>
                </div>
              ))}

              {dedupedDailyRewards.map((reward, index) => (
                <div
                  key={reward.stats.id}
                  className="flex flex-row items-center justify-between gap-6"
                >
                  <RewardChip symbol={reward.stats.rewardSymbol} hasPlus />

                  <div className="flex flex-row items-center gap-2">
                    <TokenIcon
                      className="h-6 w-6"
                      coinType={reward.stats.rewardCoinType}
                      symbol={reward.stats.rewardSymbol}
                      url={reward.stats.iconUrl}
                    />
                    <TBody className="text-primary-foreground">
                      {amountChange
                        ? `${formatToken(reward.stats.dailyReward, { exact: false })} → ${invalidAprModifier ? "N/A" : formatToken(dedupedNewDailyRewards[index].stats.dailyReward, { exact: false })}`
                        : formatToken(reward.stats.dailyReward, {
                            exact: false,
                          })}
                    </TBody>
                    <TBody className="text-muted-foreground">/day</TBody>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex flex-row items-center justify-between gap-6">
              <TTitle className="uppercase">Total APR</TTitle>
              <TBody>
                {amountChange
                  ? `${formatPercent(totalAprPercent)} -> ${invalidAprModifier ? "N/A" : formatPercent(newTotalAprPercent)}`
                  : formatPercent(totalAprPercent)}
              </TBody>
            </div>
          </>
        }
      >
        <div className="flex flex-row items-center gap-1.5">
          {[...dedupedAprRewards, ...dedupedDailyRewards].map((reward) => {
            return (
              <TokenIcon
                key={reward.stats.id}
                className="h-4 w-4"
                coinType={reward.stats.rewardCoinType}
                symbol={reward.stats.rewardSymbol}
                url={reward.stats.iconUrl}
              />
            );
          })}

          <TBody
            className={cn(
              "text-primary-foreground decoration-primary-foreground/50",
              hoverUnderlineClassName,
            )}
          >
            {amountChange
              ? `${formatPercent(totalAprPercent)} → ${invalidAprModifier ? "N/A" : formatPercent(newTotalAprPercent)}`
              : formatPercent(totalAprPercent)}
          </TBody>
        </div>
      </Tooltip>
    </div>
  );
}
