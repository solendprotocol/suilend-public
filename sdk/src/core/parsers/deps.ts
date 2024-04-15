import BigNumber from "bignumber.js";

export interface Deps {
  LendingMarket: any;
  Obligation: any;
  Reserve: any;
  PoolRewardManager: any;
  PoolReward: any;
  simulate: {
    cTokenRatio: (reserve: Deps["Reserve"]) => BigNumber;
    calculateBorrowApr: (reserve: Deps["Reserve"]) => BigNumber;
    calculateSupplyApr: (reserve: Deps["Reserve"]) => BigNumber;
    calculateUtilizationRate: (reserve: Deps["Reserve"]) => BigNumber;
  };
  RateLimiter: any;
}
