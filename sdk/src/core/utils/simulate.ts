import { bcs } from "@mysten/sui.js/bcs";
import { toHEX } from "@mysten/sui.js/utils";
import { HermesClient } from "@pythnetwork/hermes-client";
import BigNumber from "bignumber.js";
import { v4 as uuidv4 } from "uuid";

import { WAD } from "../constants";
import { linearlyInterpolate } from "../utils";

interface Deps {
  Decimal: any;
  Obligation: any;
  Deposit: any;
  Borrow: any;
  Reserve: any;
  ReserveConfig: any;
  PoolRewardManager: any;
  PoolReward: any;
  UserRewardManager: any;
  UserReward: any;
}

export class Simulate {
  Decimal: Deps["Decimal"];
  Obligation: Deps["Obligation"];
  Deposit: Deps["Deposit"];
  Borrow: Deps["Borrow"];
  Reserve: Deps["Reserve"];
  ReserveConfig: Deps["ReserveConfig"];
  PoolRewardManager: Deps["PoolRewardManager"];
  PoolReward: Deps["PoolReward"];
  UserRewardManager: Deps["UserRewardManager"];
  UserReward: Deps["UserReward"];

  constructor({
    Decimal,
    Obligation,
    Deposit,
    Borrow,
    Reserve,
    ReserveConfig,
    PoolRewardManager,
    PoolReward,
    UserRewardManager,
    UserReward,
  }: Deps) {
    this.Decimal = Decimal;
    this.Obligation = Obligation;
    this.Deposit = Deposit;
    this.Borrow = Borrow;
    this.Reserve = Reserve;
    this.ReserveConfig = ReserveConfig;
    this.PoolRewardManager = PoolRewardManager;
    this.PoolReward = PoolReward;
    this.UserRewardManager = UserRewardManager;
    this.UserReward = UserReward;
  }

  /**
   * @deprecated since version 1.0.8. Use `calculateUtilizationPercent` instead.
   */
  calculateUtilizationRate(reserve: typeof this.Reserve) {
    const { mintDecimals } = reserve;

    // From core/parsers/reserve.ts > parseReserve
    const availableAmount = new BigNumber(
      reserve.availableAmount.toString(),
    ).div(10 ** mintDecimals);
    const borrowedAmount = new BigNumber(
      reserve.borrowedAmount.value.toString(),
    )
      .div(WAD)
      .div(10 ** mintDecimals);
    const unclaimedSpreadFees = new BigNumber(
      reserve.unclaimedSpreadFees.value.toString(),
    )
      .div(WAD)
      .div(10 ** mintDecimals);

    const depositedAmount = borrowedAmount
      .plus(availableAmount)
      .minus(unclaimedSpreadFees);

    return depositedAmount.eq(0)
      ? new BigNumber(0)
      : borrowedAmount.div(depositedAmount);
  }
  calculateUtilizationPercent(reserve: typeof this.Reserve) {
    return this.calculateUtilizationRate(reserve).times(100);
  }

  /**
   * @deprecated since version 1.0.8. Use `calculateBorrowAprPercent` instead.
   */
  calculateBorrowApr(reserve: typeof this.Reserve) {
    const config = reserve.config.element as typeof this.ReserveConfig;
    const utilizationPercent = this.calculateUtilizationPercent(reserve);

    // From core/parsers/reserve.ts > parseReserveConfig
    const interestRate = (config.interestRateUtils as any[]).map(
      (util, index) => ({
        id: uuidv4(),
        utilPercent: new BigNumber(util.toString()),
        aprPercent: new BigNumber(
          config.interestRateAprs[index].toString(),
        ).div(100),
      }),
    );

    return linearlyInterpolate(
      interestRate,
      "utilPercent",
      "aprPercent",
      utilizationPercent,
    );
  }
  calculateBorrowAprPercent(reserve: typeof this.Reserve) {
    return this.calculateBorrowApr(reserve);
  }

  /**
   * @deprecated since version 1.0.8. Use `calculateDepositAprPercent` instead.
   */
  calculateSupplyApr(reserve: typeof this.Reserve) {
    const config = reserve.config.element as typeof this.ReserveConfig;
    const utilizationPercent = this.calculateUtilizationPercent(reserve);
    const borrowAprPercent = this.calculateBorrowAprPercent(reserve);

    // From core/parsers/reserve.ts > parseReserveConfig
    const spreadFeeBps = Number(config.spreadFeeBps.toString());

    return new BigNumber(utilizationPercent.div(100))
      .times(borrowAprPercent.div(100))
      .times(1 - spreadFeeBps / 10000)
      .times(100);
  }
  calculateDepositAprPercent(reserve: typeof this.Reserve) {
    return this.calculateSupplyApr(reserve);
  }

  compoundReserveInterest(
    reserve: typeof this.Reserve,
    now: number,
  ): typeof this.Reserve {
    const timeElapsedSeconds =
      now - Number(reserve.interestLastUpdateTimestampS);
    if (timeElapsedSeconds === 0) {
      return reserve;
    }
    BigNumber.config({ POW_PRECISION: 100 });
    const compoundedBorrowRate = new BigNumber(1)
      .plus(
        this.calculateBorrowAprPercent(reserve)
          .div(100)
          .div(365 * 24 * 60 * 60),
      )
      .pow(new BigNumber(timeElapsedSeconds).toNumber());
    const updatedReserve = { ...reserve };
    const oldBorrowedAmount = this.decimalToBigNumber(reserve.borrowedAmount);
    const oldCumulativeBorrowRate = this.decimalToBigNumber(
      reserve.cumulativeBorrowRate,
    );
    const oldUnclaimedSpreadFees = this.decimalToBigNumber(
      reserve.unclaimedSpreadFees,
    );
    updatedReserve.cumulativeBorrowRate = this.stringToDecimal(
      compoundedBorrowRate.multipliedBy(oldCumulativeBorrowRate).toString(),
    );
    const netNewDebt = oldBorrowedAmount.multipliedBy(
      compoundedBorrowRate.minus(1),
    );
    const spreadFee = new BigNumber(
      reserve.config.element?.spreadFeeBps?.toString() || 0,
    );
    updatedReserve.unclaimedSpreadFees = this.stringToDecimal(
      oldUnclaimedSpreadFees
        .plus(netNewDebt.multipliedBy(spreadFee.dividedBy(10000)))
        .toString(),
    );
    updatedReserve.borrowedAmount = this.stringToDecimal(
      oldBorrowedAmount.plus(netNewDebt).toString(),
    );
    updatedReserve.interestLastUpdateTimestampS = BigInt(now);

    updatedReserve.depositsPoolRewardManager = this.updatePoolRewardsManager(
      updatedReserve.depositsPoolRewardManager,
      now * 1000,
    );
    updatedReserve.borrowsPoolRewardManager = this.updatePoolRewardsManager(
      updatedReserve.borrowsPoolRewardManager,
      now * 1000,
    );

    return updatedReserve as typeof this.Reserve;
  }

  updatePoolRewardsManager(
    manager: typeof this.PoolRewardManager,
    nowMs: number,
  ): typeof this.PoolRewardManager {
    const updatedManager = { ...manager };

    const timeElapsedMs = nowMs - Number(manager.lastUpdateTimeMs);
    if (manager.totalShares === BigInt(0) || timeElapsedMs === 0) {
      return updatedManager as typeof this.PoolRewardManager;
    }

    updatedManager.poolRewards = updatedManager.poolRewards.map(
      (poolReward: typeof this.PoolReward) => {
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

        const unlockedRewards = new BigNumber(
          poolReward.totalRewards.toString(),
        )
          .multipliedBy(timePassedMs)
          .dividedBy(Number(poolReward.endTimeMs - poolReward.startTimeMs));

        updatedPoolReward.allocatedRewards = this.stringToDecimal(
          this.decimalToBigNumber(poolReward.allocatedRewards)
            .plus(unlockedRewards)
            .toString(),
        );

        updatedPoolReward.cumulativeRewardsPerShare = this.stringToDecimal(
          this.decimalToBigNumber(poolReward.cumulativeRewardsPerShare)
            .plus(unlockedRewards.dividedBy(Number(manager.totalShares)))
            .toString(),
        );

        return updatedPoolReward as typeof this.PoolReward;
      },
    );

    updatedManager.lastUpdateTimeMs = BigInt(nowMs);

    return updatedManager as typeof this.PoolRewardManager;
  }

  async refreshReservePrice(
    reserves: (typeof this.Reserve)[],
    pythConnection: HermesClient,
  ): Promise<(typeof this.Reserve)[]> {
    const priceIdentifiers = reserves.map((r) =>
      toHEX(new Uint8Array(r.priceIdentifier.bytes)),
    );
    const priceData =
      await pythConnection.getLatestPriceUpdates(priceIdentifiers);
    if (!priceData || !priceData.parsed) return reserves;

    const updatedReserves: (typeof this.Reserve)[] = [];
    for (let i = 0; i < reserves.length; i++) {
      const newReserve = { ...reserves[i] };
      newReserve.price = this.stringToDecimal(
        new BigNumber(priceData.parsed[i].price.price)
          .times(10 ** priceData.parsed[i].price.expo)
          .toString(),
      );
      newReserve.smoothedPrice = this.stringToDecimal(
        new BigNumber(priceData.parsed[i].ema_price.price)
          .times(10 ** priceData.parsed[i].ema_price.expo)
          .toString(),
      );
      newReserve.priceLastUpdateTimestampS = BigInt(
        priceData.parsed[i].price.publish_time,
      );
      updatedReserves.push(newReserve as typeof this.Reserve);
    }
    return updatedReserves;
  }

  updateUserRewardManager(
    poolManager: typeof this.PoolRewardManager,
    userRewardManager: typeof this.UserRewardManager,
    now: number,
  ): typeof this.UserRewardManager {
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
        const newRewards = this.decimalToBigNumber(
          poolReward.cumulativeRewardsPerShare,
        )
          .minus(this.decimalToBigNumber(oldReward.cumulativeRewardsPerShare))
          .multipliedBy(new BigNumber(Number(userRewardManager.share)));

        reward.earnedRewards = this.stringToDecimal(
          this.decimalToBigNumber(oldReward.earnedRewards)
            .plus(newRewards)
            .toString(),
        );

        reward.cumulativeRewardsPerShare = poolReward.cumulativeRewardsPerShare;
        updatedUserRewardManager.rewards[i] = reward as typeof this.UserReward;
      } else {
        if (userRewardManager.lastUpdateTimeMs <= poolReward.endTimeMs) {
          updatedUserRewardManager.rewards[i] = this.UserReward.fromFields({
            pool_reward_id: { bytes: poolReward.id.slice(2) },
            earned_rewards: this.stringToDecimal(
              (userRewardManager.lastUpdateTimeMs <= poolReward.startTimeMs
                ? this.decimalToBigNumber(
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

    return updatedUserRewardManager as typeof this.UserRewardManager;
  }

  refreshObligation(
    unrefreshedObligation: typeof this.Obligation,
    refreshedReserves: (typeof this.Reserve)[],
  ): typeof this.Obligation {
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
      const config = reserve.config.element as typeof this.ReserveConfig;

      obligation.userRewardManagers[
        deposit.userRewardManagerIndex as unknown as number
      ] = this.updateUserRewardManager(
        reserve.depositsPoolRewardManager,
        obligation.userRewardManagers[
          deposit.userRewardManagerIndex as unknown as number
        ],
        Date.now(),
      );

      const marketValue = this.getCTokenMarketValue(
        reserve,
        new BigNumber(deposit.depositedCtokenAmount.toString()),
      );
      const marketValueLowerBound = this.getCTokenMarketValueLowerBound(
        reserve,
        new BigNumber(deposit.depositedCtokenAmount.toString()),
      );
      deposit.marketValue = this.stringToDecimal(marketValue.toString());
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
      obligation.deposits[i] = deposit as typeof this.Deposit;
    }
    obligation.unhealthyBorrowValueUsd = this.stringToDecimal(
      unhealthyBorrowValueUsd.toString(),
    );
    obligation.allowedBorrowValueUsd = this.stringToDecimal(
      allowedBorrowValueUsd.toString(),
    );
    obligation.depositedValueUsd = this.stringToDecimal(
      depositValueUsd.toString(),
    );

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
      const config = reserve.config.element as typeof this.ReserveConfig;

      const borrow = {
        ...this.compoundDebt(unrefreshedBorrow, reserve),
      };

      obligation.userRewardManagers[
        borrow.userRewardManagerIndex as unknown as number
      ] = this.updateUserRewardManager(
        reserve.borrowsPoolRewardManager,
        obligation.userRewardManagers[
          borrow.userRewardManagerIndex as unknown as number
        ],
        Date.now(),
      );

      const marketValue = this.decimalToBigNumber(borrow.borrowedAmount)
        .multipliedBy(this.decimalToBigNumber(reserve.price))
        .dividedBy(new BigNumber(10 ** reserve.mintDecimals));

      const upperBoundPrice = BigNumber.max(
        this.decimalToBigNumber(reserve.price),
        this.decimalToBigNumber(reserve.smoothedPrice),
      );
      const marketValueUpperBound = this.decimalToBigNumber(
        reserve.borrowedAmount,
      )
        .multipliedBy(upperBoundPrice)
        .dividedBy(new BigNumber(10 ** reserve.mintDecimals));
      borrow.marketValue = this.stringToDecimal(marketValue.toString());
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
    obligation.unweightedBorrowedValueUsd = this.stringToDecimal(
      unweightedBorrowedValueUsd.toString(),
    );
    obligation.weightedBorrowedValueUpperBoundUsd = this.stringToDecimal(
      weightedBorrowedValueUpperBoundUsd.toString(),
    );
    obligation.weightedBorrowedValueUsd = this.stringToDecimal(
      weightedBorrowedValueUsd.toString(),
    );
    return obligation as typeof this.Obligation;
  }

  numberToDecimal(value: number) {
    const adjustedValue = Math.round(value * +WAD);
    return this.Decimal.fromBcs(bcs.u256().serialize(adjustedValue).toBytes());
  }

  stringToDecimal(value: string) {
    return this.numberToDecimal(new BigNumber(value).toNumber());
  }

  decimalToBigNumber(value: typeof this.Decimal) {
    return new BigNumber(value.value.toString()).div(WAD);
  }

  getCTokenMarketValue(
    reserve: typeof this.Reserve,
    depositedCTokenAmount: BigNumber,
  ): BigNumber {
    const liquidityAmount = depositedCTokenAmount.multipliedBy(
      this.cTokenRatio(reserve),
    );
    return this.decimalToBigNumber(reserve.price)
      .multipliedBy(liquidityAmount)
      .dividedBy(new BigNumber(10 ** reserve.mintDecimals));
  }

  getCTokenMarketValueLowerBound(
    reserve: typeof this.Reserve,
    depositedCTokenAmount: BigNumber,
  ): BigNumber {
    const liquidityAmount = depositedCTokenAmount.multipliedBy(
      this.cTokenRatio(reserve),
    );
    const price = BigNumber.min(
      this.decimalToBigNumber(reserve.price),
      this.decimalToBigNumber(reserve.smoothedPrice),
    );
    return price
      .multipliedBy(liquidityAmount)
      .dividedBy(new BigNumber(10 ** reserve.mintDecimals));
  }

  cTokenRatio(reserve: typeof this.Reserve): BigNumber {
    if (reserve.ctokenSupply === BigInt(0)) {
      return new BigNumber(1);
    }
    return this.totalSupply(reserve).dividedBy(
      new BigNumber(reserve.ctokenSupply.toString()),
    );
  }

  totalSupply(reserve: typeof this.Reserve) {
    return new BigNumber(reserve.availableAmount.toString())
      .plus(this.decimalToBigNumber(reserve.borrowedAmount))
      .minus(this.decimalToBigNumber(reserve.unclaimedSpreadFees));
  }

  compoundDebt(
    borrow: typeof this.Borrow,
    reserve: typeof this.Reserve,
  ): typeof this.Borrow {
    const borrowCopy = { ...borrow };
    const newCumulativeBorrowRate = this.decimalToBigNumber(
      reserve.cumulativeBorrowRate,
    );
    const compoundedInterestRate = newCumulativeBorrowRate.dividedBy(
      this.decimalToBigNumber(borrow.cumulativeBorrowRate),
    );
    borrowCopy.borrowedAmount = this.stringToDecimal(
      this.decimalToBigNumber(borrow.borrowedAmount)
        .multipliedBy(compoundedInterestRate)
        .toString(),
    );
    borrowCopy.cumulativeBorrowRate = this.stringToDecimal(
      newCumulativeBorrowRate.toString(),
    );
    return borrowCopy as typeof this.Borrow;
  }
}
