import BigNumber from "bignumber.js";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import { isSuilendPoints } from "@/lib/coinType";
import { RewardMap, RewardSummary } from "@/lib/liquidityMining";

export type PointsStats = {
  totalPoints: {
    deposit: BigNumber;
    borrow: BigNumber;
    total: BigNumber;
  };
  pointsPerDay: {
    deposit: BigNumber;
    borrow: BigNumber;
    total: BigNumber;
  };
};

export const getPointsRewards = (rewardMap: RewardMap) => {
  const deposit = Object.values(rewardMap).flatMap((rewards) =>
    rewards.deposit.filter((r) => isSuilendPoints(r.stats.rewardCoinType)),
  );
  const borrow = Object.values(rewardMap).flatMap((rewards) =>
    rewards.borrow.filter((r) => isSuilendPoints(r.stats.rewardCoinType)),
  );

  return { deposit, borrow };
};

export const getPointsStats = (
  pointsRewards: {
    deposit: RewardSummary[];
    borrow: RewardSummary[];
  },
  obligations?: ParsedObligation[],
) => {
  const totalPoints = {
    deposit: new BigNumber(0),
    borrow: new BigNumber(0),
    total: new BigNumber(0),
  };
  const pointsPerDay = {
    deposit: new BigNumber(0),
    borrow: new BigNumber(0),
    total: new BigNumber(0),
  };
  if (obligations === undefined || obligations.length === 0)
    return { totalPoints, pointsPerDay };

  obligations.forEach((obligation) => {
    pointsRewards.deposit.forEach((reward) => {
      totalPoints.deposit = totalPoints.deposit.plus(
        reward.obligationClaims[obligation.id]?.claimableAmount ??
          new BigNumber(0),
      );

      pointsPerDay.deposit = pointsPerDay.deposit.plus(
        obligation.deposits
          .find((d) => d.coinType === reward.stats.reserveCoinType)
          ?.depositedAmount.times(
            reward.stats.dailyReward ?? new BigNumber(0),
          ) ?? new BigNumber(0),
      );
    });

    pointsRewards.borrow.forEach((reward) => {
      totalPoints.borrow = totalPoints.borrow.plus(
        reward.obligationClaims[obligation.id]?.claimableAmount ??
          new BigNumber(0),
      );

      pointsPerDay.borrow = pointsPerDay.borrow.plus(
        obligation.borrows
          .find((d) => d.coinType === reward.stats.reserveCoinType)
          ?.borrowedAmount.times(
            reward.stats.dailyReward ?? new BigNumber(0),
          ) ?? new BigNumber(0),
      );
    });
  });
  totalPoints.total = totalPoints.deposit.plus(totalPoints.borrow);
  pointsPerDay.total = pointsPerDay.deposit.plus(pointsPerDay.borrow);

  return { totalPoints, pointsPerDay };
};
