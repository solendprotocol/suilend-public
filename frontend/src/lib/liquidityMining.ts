import { CoinMetadata } from "@mysten/sui.js/client";
import BigNumber from "bignumber.js";
import { cloneDeep } from "lodash";

import { WAD } from "@suilend/sdk/constants";
import { ParsedObligation } from "@suilend/sdk/parsers/obligation";
import { ParsedPoolReward, ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import { msPerYear } from "@/lib/constants";

export type RewardMap = {
  [coinType: string]: {
    deposit: RewardSummary[];
    borrow: RewardSummary[];
  };
};

type ObligationClaim = {
  claimableAmount: BigNumber;
  reserveArrayIndex: bigint;
};

export type RewardSummary = {
  stats: {
    id: string;
    active: boolean;
    rewardIndex: number;
    reserveCoinType: string;
    rewardCoinType: string;
    aprPercent?: BigNumber;
    dailyReward?: BigNumber;
    price?: BigNumber;
    iconUrl?: string | null;
    rewardSymbol: string;
    side: Side;
  };
  obligationClaims: {
    [obligationAddress: string]: ObligationClaim;
  };
};

export type AprRewardSummary = Omit<RewardSummary, "stats"> & {
  stats: RewardSummary["stats"] & {
    price: BigNumber;
    aprPercent: BigNumber;
  };
};

export type DailyRewardSummary = Omit<RewardSummary, "stats"> & {
  stats: RewardSummary["stats"] & {
    dailyReward: BigNumber;
  };
};

export function formatRewards(
  parsedReserveMap: Record<string, ParsedReserve>,
  coinMetadataMap: Record<string, CoinMetadata>,
  obligations?: ParsedObligation[],
) {
  const currentTime = new Date().getTime();

  const rewardMap: RewardMap = {};

  const getRewardSummary = (
    reserve: ParsedReserve,
    poolReward: ParsedPoolReward,
    side: Side,
  ) => {
    const rewardReserve = parsedReserveMap[poolReward.coinType];
    const rewardCoinMetadata = coinMetadataMap[poolReward.coinType];

    const aprPercent = rewardReserve
      ? poolReward.totalRewards
          .times(rewardReserve.price)
          .times(
            new BigNumber(msPerYear).div(
              poolReward.endTimeMs - poolReward.startTimeMs,
            ),
          )
          .div(reserve.depositedAmountUsd)
          .times(100)
      : undefined;
    const dailyReward = rewardReserve
      ? undefined
      : poolReward.totalRewards
          .times(
            new BigNumber(msPerYear).div(
              poolReward.endTimeMs - poolReward.startTimeMs,
            ),
          )
          .div(365)
          .div(reserve.depositedAmount);

    return {
      stats: {
        id: poolReward.id,
        active:
          currentTime >= poolReward.startTimeMs &&
          currentTime < poolReward.endTimeMs,
        rewardIndex: poolReward.rewardIndex,
        reserveCoinType: reserve.coinType,
        rewardCoinType: poolReward.coinType,
        aprPercent,
        dailyReward,
        price: rewardReserve?.price,
        iconUrl: rewardCoinMetadata.iconUrl,
        rewardSymbol: rewardCoinMetadata.symbol,
        side,
      },
      obligationClaims: Object.fromEntries(
        (obligations
          ?.map((ob) => {
            const claim = getObligationClaims(
              ob,
              poolReward,
              side === Side.DEPOSIT
                ? reserve.depositsPoolRewardManager.id
                : reserve.borrowsPoolRewardManager.id,
              reserve.arrayIndex,
            );
            if (!claim) {
              return undefined;
            }
            return [ob.id, claim];
          })
          .filter(Boolean) as Array<[string, ObligationClaim]>) ?? [],
      ),
    };
  };

  Object.values(parsedReserveMap).forEach((reserve) => {
    const depositRewards = reserve.depositsPoolRewardManager.poolRewards.map(
      (poolReward) => getRewardSummary(reserve, poolReward, Side.DEPOSIT),
    ) as RewardSummary[];

    const borrowRewards = reserve.borrowsPoolRewardManager.poolRewards.map(
      (poolReward) => getRewardSummary(reserve, poolReward, Side.BORROW),
    ) as RewardSummary[];

    rewardMap[reserve.coinType] = {
      deposit: depositRewards,
      borrow: borrowRewards,
    };
  });

  return rewardMap;
}

function getObligationClaims(
  obligation: ParsedObligation,
  poolReward: ParsedPoolReward,
  reservePoolManagerId: string,
  reserveArrayIndex: bigint,
) {
  const userRewardManager = obligation.original.userRewardManagers.find(
    (urm) => urm.poolRewardManagerId === reservePoolManagerId,
  );
  if (!userRewardManager) return;

  const userReward = userRewardManager.rewards[poolReward.rewardIndex];
  if (!userReward) return;

  return {
    // TODO: earnedRewards is refreshed via simulate.ts to only show unclaimed rewards.
    // Lifetime earned amount is not available right yet as a result.
    claimableAmount: userReward?.earnedRewards
      ? new BigNumber(userReward.earnedRewards.value.toString())
          .div(WAD)
          .div(10 ** poolReward.mintDecimals)
      : new BigNumber(0),
    reserveArrayIndex,
  };
}

export const getFilteredRewards = (rewards: RewardSummary[]): RewardSummary[] =>
  rewards.filter((r) => r.stats.active);

export const getDedupedAprRewards = (
  filteredRewards: RewardSummary[],
): AprRewardSummary[] => {
  const aprRewards = filteredRewards.filter(
    (r) => r.stats.aprPercent !== undefined,
  ) as AprRewardSummary[];

  const dedupedAprRewards: AprRewardSummary[] = [];
  for (const reward of aprRewards) {
    const index = dedupedAprRewards.findIndex(
      (r) => r.stats.rewardCoinType === reward.stats.rewardCoinType,
    );

    if (index > -1) {
      dedupedAprRewards[index].stats.aprPercent = dedupedAprRewards[
        index
      ].stats.aprPercent.plus(reward.stats.aprPercent);
    } else dedupedAprRewards.push(cloneDeep(reward));
  }

  return dedupedAprRewards;
};

export const getDedupedDailyRewards = (
  filteredRewards: RewardSummary[],
): DailyRewardSummary[] => {
  const dailyRewards = filteredRewards.filter(
    (r) => r.stats.dailyReward !== undefined,
  ) as DailyRewardSummary[];

  const dedupedDailyRewards: DailyRewardSummary[] = [];
  for (const reward of dailyRewards) {
    const index = dedupedDailyRewards.findIndex(
      (r) => r.stats.rewardCoinType === reward.stats.rewardCoinType,
    );

    if (index > -1) {
      dedupedDailyRewards[index].stats.dailyReward = dedupedDailyRewards[
        index
      ].stats.dailyReward.plus(reward.stats.dailyReward);
    } else dedupedDailyRewards.push(cloneDeep(reward));
  }

  return dedupedDailyRewards;
};

export const getTotalAprPercent = (
  aprPercent: BigNumber,
  filteredRewards: RewardSummary[],
) => {
  const dedupedAprRewards = getDedupedAprRewards(filteredRewards);

  const totalAprPercent = aprPercent.plus(
    dedupedAprRewards.reduce(
      (acc, reward) => acc.plus(reward.stats.aprPercent),
      new BigNumber(0),
    ),
  );

  return totalAprPercent;
};
