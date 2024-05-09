import BigNumber from "bignumber.js";
import { capitalize } from "lodash";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import RewardChip from "@/components/shared/RewardChip";
import TokenIcon from "@/components/shared/TokenIcon";
import Tooltip from "@/components/shared/Tooltip";
import {
  TBody,
  TLabel,
  TLabelSans,
  TTitle,
} from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { isSuilendPoints } from "@/lib/coinType";
import { formatPercent, formatPoints, formatToken } from "@/lib/format";
import {
  AprRewardSummary,
  DailyRewardSummary,
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

const formatApr = (
  value: BigNumber,
  newValue: BigNumber,
  isAprModifierInvalid: boolean,
  showChange: boolean,
) =>
  showChange
    ? `${formatPercent(value)} → ${isAprModifierInvalid ? "N/A" : formatPercent(newValue)}`
    : formatPercent(value);

const formatPointsDailyReward = (
  value: BigNumber,
  newValue: BigNumber,
  isAprModifierInvalid: boolean,
  showChange: boolean,
) =>
  showChange ? (
    <>
      {formatPoints(value, { dp: 4 })}
      {" → "}${isAprModifierInvalid ? "N/A" : formatPoints(newValue, { dp: 4 })}
    </>
  ) : (
    formatPoints(value, { dp: 4 })
  );

const formatTokenDailyReward = (
  value: BigNumber,
  newValue: BigNumber,
  isAprModifierInvalid: boolean,
  showChange: boolean,
) =>
  showChange ? (
    <>
      {formatToken(value, { exact: false })}
      {" → "}
      {isAprModifierInvalid ? "N/A" : formatToken(newValue, { exact: false })}
    </>
  ) : (
    formatToken(value, { exact: false })
  );

interface AprRewardRowProps {
  reward: AprRewardSummary;
  newReward: AprRewardSummary;
  isAprModifierInvalid: boolean;
  showChange: boolean;
}

function AprRewardRow({
  reward,
  newReward,
  isAprModifierInvalid,
  showChange,
}: AprRewardRowProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-6">
      <RewardChip
        coinType={reward.stats.rewardCoinType}
        symbol={reward.stats.rewardSymbol}
      />

      <div className="flex flex-row items-center gap-1.5">
        <TokenIcon
          className="h-4 w-4"
          coinType={reward.stats.rewardCoinType}
          symbol={reward.stats.rewardSymbol}
          url={reward.stats.iconUrl}
        />
        <TBody className="text-primary-foreground">
          {formatApr(
            reward.stats.aprPercent,
            newReward.stats.aprPercent,
            isAprModifierInvalid,
            showChange,
          )}
        </TBody>
      </div>
    </div>
  );
}

interface DailyRewardRowProps {
  reserve: ParsedReserve;
  reward: DailyRewardSummary;
  newReward: DailyRewardSummary;
  isAprModifierInvalid: boolean;
  showChange: boolean;
}

function DailyRewardRow({
  reserve,
  reward,
  newReward,
  isAprModifierInvalid,
  showChange,
}: DailyRewardRowProps) {
  return (
    <div className="flex flex-row items-start justify-between gap-6">
      <RewardChip
        coinType={reward.stats.rewardCoinType}
        symbol={reward.stats.rewardSymbol}
      />

      <div className="flex flex-col items-end gap-0.5">
        <div className="flex flex-row items-center gap-1.5">
          <TokenIcon
            className="h-4 w-4"
            coinType={reward.stats.rewardCoinType}
            symbol={reward.stats.rewardSymbol}
            url={reward.stats.iconUrl}
          />
          <TBody className="text-primary-foreground">
            {(isSuilendPoints(reward.stats.rewardCoinType)
              ? formatPointsDailyReward
              : formatTokenDailyReward)(
              reward.stats.dailyReward,
              newReward.stats.dailyReward,
              isAprModifierInvalid,
              showChange,
            )}
          </TBody>
        </div>
        <TLabel className="uppercase">per {reserve.symbol} per day</TLabel>
      </div>
    </div>
  );
}

interface AprWithRewardsBreakdownProps {
  side: Side;
  aprPercent: BigNumber;
  rewards: RewardSummary[];
  reserve: ParsedReserve;
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
  if (amountChange) {
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
      side === Side.DEPOSIT ? reserve.depositedAmount : reserve.borrowedAmount;
    aprModifier = amountChange.plus(poolTotal).isZero()
      ? new BigNumber(-1)
      : poolTotal.div(amountChange.plus(poolTotal));
  }

  const isAprModifierInvalid = aprModifier.isNegative();
  const showChange = amountChange !== undefined;

  // Daily
  const dailyRewards = getDedupedDailyRewards(filteredRewards);
  const newDailyRewards = dailyRewards.map((r) => ({
    ...r,
    stats: {
      ...r.stats,
      dailyReward: r.stats.dailyReward.times(aprModifier),
    },
  }));

  const pointsDailyRewards = dailyRewards.filter((r) =>
    isSuilendPoints(r.stats.rewardCoinType),
  );
  const newPointsDailyRewards = newDailyRewards.filter((r) =>
    isSuilendPoints(r.stats.rewardCoinType),
  );

  const nonPointsDailyRewards = dailyRewards.filter(
    (r) => !isSuilendPoints(r.stats.rewardCoinType),
  );
  const newNonPointsDailyRewards = newDailyRewards.filter(
    (r) => !isSuilendPoints(r.stats.rewardCoinType),
  );

  // APR
  const aprRewards = getDedupedAprRewards(filteredRewards);
  const newAprRewards = aprRewards.map((r) => ({
    ...r,
    stats: {
      ...r.stats,
      aprPercent: r.stats.aprPercent.times(aprModifier),
    },
  }));

  // Total APR
  const totalAprPercent = getTotalAprPercent(aprPercent, filteredRewards);

  const newTotalAprPercent = newAprPercent.plus(
    newAprRewards.reduce(
      (acc, reward) => acc.plus(reward.stats.aprPercent),
      new BigNumber(0),
    ),
  );

  if (filteredRewards.length === 0)
    return (
      <TBody>
        {formatApr(
          totalAprPercent,
          newTotalAprPercent,
          isAprModifierInvalid,
          showChange,
        )}
      </TBody>
    );
  return (
    <div>
      <Tooltip
        contentProps={{
          className: "px-4 py-4 flex-col flex gap-4 min-w-[300px]",
          style: { maxWidth: "none" },
        }}
        content={
          <>
            {pointsDailyRewards.length > 0 && (
              <>
                <div className="flex flex-col gap-1">
                  <TBody className="uppercase">Points boost</TBody>
                  <TLabelSans>
                    Deposit {reserve.symbol} to earn points.
                  </TLabelSans>
                </div>

                <div className="flex flex-col gap-3">
                  {pointsDailyRewards.map((reward, index) => (
                    <DailyRewardRow
                      key={index}
                      reserve={reserve}
                      reward={reward}
                      newReward={newPointsDailyRewards[index]}
                      isAprModifierInvalid={isAprModifierInvalid}
                      showChange={showChange}
                    />
                  ))}
                </div>

                <Separator />
              </>
            )}

            <div className="flex flex-row items-center justify-between gap-6">
              <TLabel className="uppercase">{capitalize(side)} APR</TLabel>
              <TBody>
                {formatApr(
                  aprPercent,
                  newAprPercent,
                  isAprModifierInvalid,
                  showChange,
                )}
              </TBody>
            </div>

            {(aprRewards.length > 0 || nonPointsDailyRewards.length > 0) && (
              <>
                <div className="flex flex-col gap-3">
                  {aprRewards.map((reward, index) => (
                    <AprRewardRow
                      key={index}
                      reward={reward}
                      newReward={newAprRewards[index]}
                      isAprModifierInvalid={isAprModifierInvalid}
                      showChange={showChange}
                    />
                  ))}

                  {nonPointsDailyRewards.map((reward, index) => (
                    <DailyRewardRow
                      key={index}
                      reserve={reserve}
                      reward={reward}
                      newReward={newNonPointsDailyRewards[index]}
                      isAprModifierInvalid={isAprModifierInvalid}
                      showChange={showChange}
                    />
                  ))}
                </div>

                <Separator />
              </>
            )}

            <div className="flex flex-row items-center justify-between gap-6">
              <TTitle className="uppercase">Total APR</TTitle>
              <TBody>
                {formatApr(
                  totalAprPercent,
                  newTotalAprPercent,
                  isAprModifierInvalid,
                  showChange,
                )}
              </TBody>
            </div>
          </>
        }
      >
        <div className="flex flex-row items-center gap-1.5">
          {[...pointsDailyRewards, ...aprRewards, ...nonPointsDailyRewards].map(
            (reward, index) => {
              return (
                <TokenIcon
                  key={index}
                  className="h-4 w-4"
                  coinType={reward.stats.rewardCoinType}
                  symbol={reward.stats.rewardSymbol}
                  url={reward.stats.iconUrl}
                />
              );
            },
          )}

          <TBody
            className={cn(
              "text-primary-foreground decoration-primary-foreground/50",
              hoverUnderlineClassName,
            )}
          >
            {formatApr(
              totalAprPercent,
              newTotalAprPercent,
              isAprModifierInvalid,
              showChange,
            )}
          </TBody>
        </div>
      </Tooltip>
    </div>
  );
}
