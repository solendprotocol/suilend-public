import BigNumber from "bignumber.js";
import { capitalize } from "lodash";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";
import { linearlyInterpolate } from "@suilend/sdk/utils";

import AprRewardsBreakdownRow from "@/components/dashboard/AprRewardsBreakdownRow";
import TokenLogo from "@/components/shared/TokenLogo";
import TokenLogos from "@/components/shared/TokenLogos";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TBodySans, TLabelSans } from "@/components/shared/Typography";
import { isSuilendPoints } from "@/lib/coinType";
import { formatPercent, formatPoints, formatToken } from "@/lib/format";
import {
  RewardSummary,
  getDedupedAprRewards,
  getDedupedPerDayRewards,
  getFilteredRewards,
  getTotalAprPercent,
} from "@/lib/liquidityMining";
import { cn, hoverUnderlineClassName } from "@/lib/utils";

const calculateUtilizationPercent = (reserve: ParsedReserve) => {
  const depositedAmount = reserve.borrowedAmount.plus(reserve.availableAmount);
  const borrowedAmount = reserve.borrowedAmount;

  return depositedAmount.eq(0)
    ? new BigNumber(0)
    : borrowedAmount.div(depositedAmount).times(100);
};

const calculateBorrowAprPercent = (reserve: ParsedReserve) => {
  const config = reserve.config;
  const utilizationPercent = calculateUtilizationPercent(reserve);

  return linearlyInterpolate(
    config.interestRate,
    "utilPercent",
    "aprPercent",
    utilizationPercent,
  );
};

const calculateDepositAprPercent = (reserve: ParsedReserve) => {
  const config = reserve.config;
  const utilizationPercent = calculateUtilizationPercent(reserve);
  const borrowAprPercent = calculateBorrowAprPercent(reserve);

  return new BigNumber(utilizationPercent.div(100))
    .times(borrowAprPercent.div(100))
    .times(1 - config.spreadFeeBps / 10000)
    .times(100);
};

const formatPerDay = (
  coinType: string,
  value: BigNumber,
  newValue: BigNumber,
  isAprModifierInvalid: boolean,
  showChange: boolean,
) => {
  const formatter = (_value: BigNumber) =>
    isSuilendPoints(coinType)
      ? formatPoints(_value, { dp: 3 })
      : formatToken(_value, { exact: false });

  return showChange && !newValue.eq(value)
    ? `${formatter(value)} → ${isAprModifierInvalid ? "N/A" : formatter(newValue)}`
    : formatter(value);
};

const formatAprPercent = (
  value: BigNumber,
  newValue: BigNumber,
  isAprModifierInvalid: boolean,
  showChange: boolean,
) =>
  showChange && !newValue.eq(value)
    ? `${formatPercent(value, { useAccountingSign: true })} → ${isAprModifierInvalid ? "N/A" : formatPercent(newValue, { useAccountingSign: true })}`
    : formatPercent(value, { useAccountingSign: true });

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
              0,
            ),
          }
        : {
            borrowedAmount: BigNumber.max(
              reserve.borrowedAmount.plus(amountChange),
              0,
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
    aprModifier = amountChange.plus(poolTotal).eq(0)
      ? new BigNumber(-1)
      : poolTotal.div(amountChange.plus(poolTotal));
  }

  const isAprModifierInvalid = aprModifier.isNegative();
  const showChange = amountChange !== undefined;

  // Per day rewards
  const perDayRewards = getDedupedPerDayRewards(filteredRewards);
  const newPerDayRewards = perDayRewards.map((r) => ({
    ...r,
    stats: {
      ...r.stats,
      perDay: r.stats.perDay.times(aprModifier),
    },
  }));

  // APR rewards
  const aprRewards = getDedupedAprRewards(filteredRewards);
  const newAprRewards = aprRewards.map((r) => ({
    ...r,
    stats: {
      ...r.stats,
      aprPercent: r.stats.aprPercent.times(aprModifier),
    },
  }));

  // Total APR
  const totalAprPercent = getTotalAprPercent(side, aprPercent, filteredRewards);
  const newTotalAprPercent = getTotalAprPercent(
    side,
    newAprPercent,
    newAprRewards,
  );

  if (filteredRewards.length === 0)
    return (
      <TBody>
        {formatAprPercent(
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
          className: "px-4 py-4 flex-col flex gap-4 min-w-[280px]",
          style: { maxWidth: "max-content" },
        }}
        content={
          <>
            <TLabelSans>
              {capitalize(side)} {reserve.symbol}
              {" and earn "}
              {perDayRewards.length > 0 && (
                <>points{aprRewards.length > 0 && " & "}</>
              )}
              {aprRewards.length > 0 && "rewards"}
            </TLabelSans>

            {perDayRewards.length > 0 && (
              <div className="flex flex-col gap-2">
                <TBodySans>Points</TBodySans>

                {perDayRewards.map((reward, index) => (
                  <AprRewardsBreakdownRow
                    key={index}
                    isLast={index === perDayRewards.length - 1}
                    value={
                      <>
                        {formatPerDay(
                          reward.stats.rewardCoinType,
                          reward.stats.perDay,
                          newPerDayRewards[index].stats.perDay,
                          isAprModifierInvalid,
                          showChange,
                        )}
                        <br />
                        <span className="font-sans text-muted-foreground">
                          Per {reserve.symbol} per day
                        </span>
                      </>
                    }
                  >
                    <TokenLogo
                      className="h-4 w-4"
                      token={{
                        coinType: reward.stats.rewardCoinType,
                        symbol: reward.stats.symbol,
                        iconUrl: reward.stats.iconUrl,
                      }}
                    />
                    <TLabelSans>{reward.stats.symbol}</TLabelSans>
                  </AprRewardsBreakdownRow>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-between gap-4">
                <TBodySans>{capitalize(side)} APR</TBodySans>
                <TBody>
                  {formatAprPercent(
                    totalAprPercent,
                    newTotalAprPercent,
                    isAprModifierInvalid,
                    showChange,
                  )}
                </TBody>
              </div>

              <AprRewardsBreakdownRow
                isLast={aprRewards.length === 0}
                value={formatAprPercent(
                  aprPercent,
                  newAprPercent,
                  isAprModifierInvalid,
                  showChange,
                )}
              >
                <TLabelSans>Interest</TLabelSans>
              </AprRewardsBreakdownRow>

              {aprRewards.map((reward, index) => (
                <AprRewardsBreakdownRow
                  key={index}
                  isLast={index === aprRewards.length - 1}
                  value={formatAprPercent(
                    reward.stats.aprPercent.times(
                      side === Side.DEPOSIT ? 1 : -1,
                    ),
                    newAprRewards[index].stats.aprPercent.times(
                      side === Side.DEPOSIT ? 1 : -1,
                    ),
                    isAprModifierInvalid,
                    showChange,
                  )}
                >
                  <TLabelSans>Rewards in</TLabelSans>
                  <TokenLogo
                    className="h-4 w-4"
                    token={{
                      coinType: reward.stats.rewardCoinType,
                      symbol: reward.stats.symbol,
                      iconUrl: reward.stats.iconUrl,
                    }}
                  />
                  <TLabelSans>{reward.stats.symbol}</TLabelSans>
                </AprRewardsBreakdownRow>
              ))}
            </div>
          </>
        }
      >
        <div className="relative flex flex-row items-center">
          <TokenLogos
            className="h-4 w-4"
            tokens={[...perDayRewards, ...aprRewards].map((reward) => ({
              coinType: reward.stats.rewardCoinType,
              symbol: reward.stats.symbol,
              iconUrl: reward.stats.iconUrl,
            }))}
          />

          <TBody
            className={cn(
              "ml-1.5 text-primary-foreground decoration-primary-foreground/50",
              hoverUnderlineClassName,
            )}
          >
            {formatAprPercent(
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
