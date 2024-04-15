import { bcs } from "@mysten/sui.js/bcs";
import { toHEX } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";

import { SuiPriceServiceConnection } from "../../../../pyth-sdk/src";
import { Decimal } from "../_generated/suilend/decimal/structs";
import {
  PoolReward,
  PoolRewardManager,
  UserReward,
  UserRewardManager,
} from "../_generated/suilend/liquidity-mining/structs";
import {
  Borrow,
  Deposit,
  Obligation,
} from "../_generated/suilend/obligation/structs";
import { Reserve } from "../_generated/suilend/reserve/structs";
import { ReserveConfig } from "../_generated/suilend/reserve-config/structs";

export function calculateUtilizationRate(reserve: Reserve<string>) {
  // Units are decimal
  const totalSupplyExcludingFees = new BigNumber(
    reserve.availableAmount.toString(),
  ).plus(decimalToBigNumber(reserve.borrowedAmount));
  if (totalSupplyExcludingFees.eq(new BigNumber(0))) {
    return new BigNumber(0);
  }
  return decimalToBigNumber(reserve.borrowedAmount).dividedBy(
    totalSupplyExcludingFees,
  );
}

export function calculateBorrowApr(reserve: Reserve<string>) {
  const config = reserve.config.element as ReserveConfig;
  const length = config.interestRateUtils.length;
  const currentUtil = calculateUtilizationRate(reserve).toNumber();
  let i = 1;
  while (i < length) {
    const leftUtil = config.interestRateUtils[i - 1] / 100;
    const rightUtil = config.interestRateUtils[i] / 100;
    if (currentUtil >= leftUtil && currentUtil <= rightUtil) {
      const leftAPR = config.interestRateAprs[i - 1];
      const rightAPR = config.interestRateAprs[i];
      const weight = (currentUtil - leftUtil) / (rightUtil - leftUtil);
      const aprDiff = rightAPR - leftAPR;
      return new BigNumber(
        new BigNumber(leftAPR.toString())
          .plus(
            new BigNumber(weight).multipliedBy(
              new BigNumber(aprDiff.toString()),
            ),
          )
          .toString(),
      ).dividedBy(new BigNumber(100));
    }
    i = i + 1;
  }
  // Should never reach here
  return new BigNumber(0);
}

export function calculateSupplyApr(reserve: Reserve<string>) {
  const borrowApr = calculateBorrowApr(reserve);
  const currentUtil = calculateUtilizationRate(reserve);

  const protocolTakePercentage = new BigNumber(1).minus(
    new BigNumber(
      reserve.config.element?.spreadFeeBps?.toString() || 0,
    ).dividedBy(10000),
  );

  return currentUtil.times(borrowApr).times(protocolTakePercentage);
}

export function compoundReserveInterest(
  reserve: Reserve<string>,
  now: number,
): Reserve<string> {
  const timeElapsedSeconds = now - Number(reserve.interestLastUpdateTimestampS);
  if (timeElapsedSeconds === 0) {
    return reserve;
  }
  BigNumber.config({ POW_PRECISION: 100 });
  const compoundedBorrowRate = new BigNumber(1)
    .plus(
      calculateBorrowApr(reserve).dividedBy(
        new BigNumber(100 * 365 * 24 * 60 * 60),
      ),
    )
    .pow(new BigNumber(timeElapsedSeconds).toNumber());
  const updatedReserve = { ...reserve };
  const oldBorrowedAmount = decimalToBigNumber(reserve.borrowedAmount);
  const oldCumulativeBorrowRate = decimalToBigNumber(
    reserve.cumulativeBorrowRate,
  );
  const oldUnclaimedSpreadFees = decimalToBigNumber(
    reserve.unclaimedSpreadFees,
  );
  updatedReserve.cumulativeBorrowRate = stringToDecimal(
    compoundedBorrowRate.multipliedBy(oldCumulativeBorrowRate).toString(),
  );
  const netNewDebt = oldBorrowedAmount.multipliedBy(
    compoundedBorrowRate.minus(1),
  );
  const spreadFee = new BigNumber(
    reserve.config.element?.spreadFeeBps?.toString() || 0,
  );
  updatedReserve.unclaimedSpreadFees = stringToDecimal(
    oldUnclaimedSpreadFees
      .plus(netNewDebt.multipliedBy(spreadFee.dividedBy(10000)))
      .toString(),
  );
  updatedReserve.borrowedAmount = stringToDecimal(
    oldBorrowedAmount.plus(netNewDebt).toString(),
  );
  updatedReserve.interestLastUpdateTimestampS = BigInt(now);

  updatedReserve.depositsPoolRewardManager = updatePoolRewardsManager(
    updatedReserve.depositsPoolRewardManager,
    now * 1000,
  );
  updatedReserve.borrowsPoolRewardManager = updatePoolRewardsManager(
    updatedReserve.borrowsPoolRewardManager,
    now * 1000,
  );

  return updatedReserve as Reserve<string>;
}

export function updatePoolRewardsManager(
  manager: PoolRewardManager,
  nowMs: number,
): PoolRewardManager {
  const updatedManager = { ...manager };

  const timeElapsedMs = nowMs - Number(manager.lastUpdateTimeMs);
  if (manager.totalShares === BigInt(0) || timeElapsedMs === 0) {
    return updatedManager as PoolRewardManager;
  }

  updatedManager.poolRewards = updatedManager.poolRewards.map((poolReward) => {
    if (poolReward === null) {
      return poolReward;
    }

    if (
      nowMs < poolReward.startTimeMs ||
      manager.lastUpdateTimeMs >= poolReward.endTimeMs
    ) {
      return poolReward;
    }

    const updatedPoolReward = { ...poolReward };

    const endTimeMs = Number(poolReward.endTimeMs);
    const startTimeMs = Number(poolReward.startTimeMs);
    const lastUpdateTimeMs = Number(manager.lastUpdateTimeMs);

    const timePassedMs =
      Math.min(nowMs, endTimeMs) - Math.max(startTimeMs, lastUpdateTimeMs);

    const unlockedRewards = new BigNumber(poolReward.totalRewards.toString())
      .multipliedBy(timePassedMs)
      .dividedBy(Number(poolReward.endTimeMs - poolReward.startTimeMs));

    updatedPoolReward.allocatedRewards = stringToDecimal(
      decimalToBigNumber(poolReward.allocatedRewards)
        .plus(unlockedRewards)
        .toString(),
    );

    updatedPoolReward.cumulativeRewardsPerShare = stringToDecimal(
      decimalToBigNumber(poolReward.cumulativeRewardsPerShare)
        .plus(unlockedRewards.dividedBy(Number(manager.totalShares)))
        .toString(),
    );

    return updatedPoolReward as PoolReward;
  });

  updatedManager.lastUpdateTimeMs = BigInt(nowMs);

  return updatedManager as PoolRewardManager;
}

export async function refreshReservePrice(
  reserves: Reserve<string>[],
  pythConnection: SuiPriceServiceConnection,
): Promise<Reserve<string>[]> {
  const priceIdentifiers = reserves.map((r) =>
    toHEX(new Uint8Array(r.priceIdentifier.bytes)),
  );
  const priceData = await pythConnection.getLatestPriceFeeds(priceIdentifiers);
  if (!priceData) return reserves;

  const updatedReserves: Reserve<string>[] = [];
  for (let i = 0; i < reserves.length; i++) {
    const newReserve = { ...reserves[i] };
    newReserve.price = stringToDecimal(
      priceData[i].getPriceUnchecked().getPriceAsNumberUnchecked().toString(),
    );
    newReserve.smoothedPrice = stringToDecimal(
      priceData[i]
        .getEmaPriceUnchecked()
        .getPriceAsNumberUnchecked()
        .toString(),
    );
    newReserve.priceLastUpdateTimestampS = BigInt(
      priceData[i].getPriceUnchecked().publishTime,
    );
    updatedReserves.push(newReserve as Reserve<string>);
  }
  return updatedReserves;
}

function updateUserRewardManager(
  poolManager: PoolRewardManager,
  userRewardManager: UserRewardManager,
  now: number,
): UserRewardManager {
  const updatedUserRewardManager = { ...userRewardManager };

  for (let i = 0; i < poolManager.poolRewards.length; i++) {
    const poolReward = poolManager.poolRewards[i];
    if (poolReward == null) {
      continue;
    }

    if (i >= userRewardManager.rewards.length) {
      userRewardManager.rewards.push(null);
    }

    const oldReward = updatedUserRewardManager.rewards[i];
    const reward = { ...oldReward };
    if (oldReward != null) {
      const newRewards = decimalToBigNumber(
        poolReward.cumulativeRewardsPerShare,
      )
        .minus(decimalToBigNumber(oldReward.cumulativeRewardsPerShare))
        .multipliedBy(new BigNumber(Number(userRewardManager.share)));

      reward.earnedRewards = stringToDecimal(
        decimalToBigNumber(oldReward.earnedRewards).plus(newRewards).toString(),
      );

      reward.cumulativeRewardsPerShare = poolReward.cumulativeRewardsPerShare;
      updatedUserRewardManager.rewards[i] = reward as UserReward;
    } else {
      if (userRewardManager.lastUpdateTimeMs <= poolReward.endTimeMs) {
        updatedUserRewardManager.rewards[i] = UserReward.fromFields({
          pool_reward_id: { bytes: poolReward.id.slice(2) },
          earned_rewards: stringToDecimal(
            (userRewardManager.lastUpdateTimeMs <= poolReward.startTimeMs
              ? decimalToBigNumber(
                  poolReward.cumulativeRewardsPerShare,
                ).multipliedBy(new BigNumber(Number(userRewardManager.share)))
              : new BigNumber(0)
            ).toString(),
          ),
          cumulative_rewards_per_share: poolReward.cumulativeRewardsPerShare,
        });
      }
    }
  }

  updatedUserRewardManager.lastUpdateTimeMs = BigInt(now);

  return updatedUserRewardManager as UserRewardManager;
}

export function refreshObligation(
  unrefreshedObligation: Obligation<string>,
  refreshedReserves: Reserve<string>[],
): Obligation<string> {
  const obligation = { ...unrefreshedObligation };
  // Refresh Deposits
  let depositValueUsd = new BigNumber(0);
  let allowedBorrowValueUsd = new BigNumber(0);
  let unhealthyBorrowValueUsd = new BigNumber(0);

  for (let i = 0; i < obligation.deposits.length; i++) {
    const deposit = { ...obligation.deposits[i] };
    const reserve = refreshedReserves.find(
      (r) => r.coinType.name === deposit.coinType.name,
    );
    if (!reserve) {
      throw new Error(
        `Unable to find reserve for coin type ${deposit.coinType.name}`,
      );
    }
    const config = reserve.config.element as ReserveConfig;

    obligation.userRewardManagers[
      deposit.userRewardManagerIndex as unknown as number
    ] = updateUserRewardManager(
      reserve.depositsPoolRewardManager,
      obligation.userRewardManagers[
        deposit.userRewardManagerIndex as unknown as number
      ],
      Date.now(),
    );

    const marketValue = getCTokenMarketValue(
      reserve,
      new BigNumber(deposit.depositedCtokenAmount.toString()),
    );
    const marketValueLowerBound = getCTokenMarketValueLowerBound(
      reserve,
      new BigNumber(deposit.depositedCtokenAmount.toString()),
    );
    deposit.marketValue = stringToDecimal(marketValue.toString());
    depositValueUsd = depositValueUsd.plus(
      new BigNumber(marketValue.toString()),
    );
    allowedBorrowValueUsd = allowedBorrowValueUsd.plus(
      marketValueLowerBound.multipliedBy(
        new BigNumber(config.openLtvPct / 100),
      ),
    );
    unhealthyBorrowValueUsd = unhealthyBorrowValueUsd.plus(
      marketValue.multipliedBy(new BigNumber(config.closeLtvPct / 100)),
    );
    obligation.deposits[i] = deposit as Deposit;
  }
  obligation.unhealthyBorrowValueUsd = stringToDecimal(
    unhealthyBorrowValueUsd.toString(),
  );
  obligation.allowedBorrowValueUsd = stringToDecimal(
    allowedBorrowValueUsd.toString(),
  );
  obligation.depositedValueUsd = stringToDecimal(depositValueUsd.toString());

  // Refresh borrows
  let unweightedBorrowedValueUsd = new BigNumber(0);
  let weightedBorrowedValueUsd = new BigNumber(0);
  let weightedBorrowedValueUpperBoundUsd = new BigNumber(0);
  for (let i = 0; i < obligation.borrows.length; i++) {
    const unrefreshedBorrow = obligation.borrows[i];
    const reserve = refreshedReserves.find(
      (r) => r.coinType.name == unrefreshedBorrow.coinType.name,
    );
    if (!reserve) {
      throw new Error(
        `Unable to find reserve for coin type ${unrefreshedBorrow.coinType.name}`,
      );
    }
    const config = reserve.config.element as ReserveConfig;

    const borrow = { ...compoundDebt(unrefreshedBorrow, reserve) };

    obligation.userRewardManagers[
      borrow.userRewardManagerIndex as unknown as number
    ] = updateUserRewardManager(
      reserve.borrowsPoolRewardManager,
      obligation.userRewardManagers[
        borrow.userRewardManagerIndex as unknown as number
      ],
      Date.now(),
    );

    const marketValue = decimalToBigNumber(borrow.borrowedAmount)
      .multipliedBy(decimalToBigNumber(reserve.price))
      .dividedBy(new BigNumber(10 ** reserve.mintDecimals));

    const upperBoundPrice = BigNumber.max(
      decimalToBigNumber(reserve.price),
      decimalToBigNumber(reserve.smoothedPrice),
    );
    const marketValueUpperBound = decimalToBigNumber(reserve.borrowedAmount)
      .multipliedBy(upperBoundPrice)
      .dividedBy(new BigNumber(10 ** reserve.mintDecimals));
    borrow.marketValue = stringToDecimal(marketValue.toString());
    unweightedBorrowedValueUsd = unweightedBorrowedValueUsd.plus(marketValue);
    const borrowWeight = new BigNumber(
      (config.borrowWeightBps / BigInt(10000)).toString(),
    );
    weightedBorrowedValueUsd = weightedBorrowedValueUsd.plus(
      marketValue.multipliedBy(borrowWeight),
    );
    weightedBorrowedValueUpperBoundUsd =
      weightedBorrowedValueUpperBoundUsd.plus(
        marketValueUpperBound.multipliedBy(borrowWeight),
      );
  }
  obligation.unweightedBorrowedValueUsd = stringToDecimal(
    unweightedBorrowedValueUsd.toString(),
  );
  obligation.weightedBorrowedValueUpperBoundUsd = stringToDecimal(
    weightedBorrowedValueUpperBoundUsd.toString(),
  );
  obligation.weightedBorrowedValueUsd = stringToDecimal(
    weightedBorrowedValueUsd.toString(),
  );
  return obligation as Obligation<string>;
}

export function numberToDecimal(value: number) {
  const adjustedValue = Math.round(value * 10 ** 18);
  return Decimal.fromBcs(bcs.u256().serialize(adjustedValue).toBytes());
}

export function stringToDecimal(value: string) {
  return numberToDecimal(new BigNumber(value).toNumber());
}

export function decimalToBigNumber(value: Decimal) {
  return new BigNumber(value.value.toString()).dividedBy(
    new BigNumber(10 ** 18),
  );
}

function getCTokenMarketValue(
  reserve: Reserve<string>,
  depositedCTokenAmount: BigNumber,
): BigNumber {
  const liquidityAmount = depositedCTokenAmount.multipliedBy(
    cTokenRatio(reserve),
  );
  return decimalToBigNumber(reserve.price)
    .multipliedBy(liquidityAmount)
    .dividedBy(new BigNumber(10 ** reserve.mintDecimals));
}

function getCTokenMarketValueLowerBound(
  reserve: Reserve<string>,
  depositedCTokenAmount: BigNumber,
): BigNumber {
  const liquidityAmount = depositedCTokenAmount.multipliedBy(
    cTokenRatio(reserve),
  );
  const price = BigNumber.min(
    decimalToBigNumber(reserve.price),
    decimalToBigNumber(reserve.smoothedPrice),
  );
  return price
    .multipliedBy(liquidityAmount)
    .dividedBy(new BigNumber(10 ** reserve.mintDecimals));
}

export function cTokenRatio(reserve: Reserve<string>): BigNumber {
  if (reserve.ctokenSupply === BigInt(0)) {
    return new BigNumber(1);
  }
  return totalSupply(reserve).dividedBy(
    new BigNumber(reserve.ctokenSupply.toString()),
  );
}

export function totalSupply(reserve: Reserve<string>) {
  return new BigNumber(reserve.availableAmount.toString())
    .plus(decimalToBigNumber(reserve.borrowedAmount))
    .minus(decimalToBigNumber(reserve.unclaimedSpreadFees));
}

function compoundDebt(borrow: Borrow, reserve: Reserve<string>): Borrow {
  const borrowCopy = { ...borrow };
  const newCumulativeBorrowRate = decimalToBigNumber(
    reserve.cumulativeBorrowRate,
  );
  const compoundedInterestRate = newCumulativeBorrowRate.dividedBy(
    decimalToBigNumber(borrow.cumulativeBorrowRate),
  );
  borrowCopy.borrowedAmount = stringToDecimal(
    decimalToBigNumber(borrow.borrowedAmount)
      .multipliedBy(compoundedInterestRate)
      .toString(),
  );
  borrowCopy.cumulativeBorrowRate = stringToDecimal(
    newCumulativeBorrowRate.toString(),
  );
  return borrowCopy as Borrow;
}
