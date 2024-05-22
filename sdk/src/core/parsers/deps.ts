import BigNumber from "bignumber.js";

export interface Deps {
  LendingMarket: any;
  Obligation: any;
  Reserve: any;
  PoolRewardManager: any;
  PoolReward: any;
  simulate: {
    calculateUtilizationPercent: (reserve: Deps["Reserve"]) => BigNumber;
    calculateBorrowAprPercent: (reserve: Deps["Reserve"]) => BigNumber;
    calculateDepositAprPercent: (reserve: Deps["Reserve"]) => BigNumber;
    cTokenRatio: (reserve: Deps["Reserve"]) => BigNumber;
  };
  RateLimiter: any;
}
