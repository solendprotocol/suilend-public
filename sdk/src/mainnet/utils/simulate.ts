import { SuiPriceServiceConnection } from "@pythnetwork/pyth-sui-js";
import BigNumber from "bignumber.js";

import { Simulate } from "../../core/utils/simulate";
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

const deps = {
  Decimal,
  Obligation: Obligation<string>,
  Deposit,
  Borrow,
  Reserve: Reserve<string>,
  ReserveConfig,
  PoolRewardManager,
  PoolReward,
  UserRewardManager,
  UserReward,
};
const simulate = new Simulate(deps);

/**
 * @deprecated since version 1.0.8. Use `calculateUtilizationPercent` instead.
 */
export const calculateUtilizationRate = (reserve: Reserve<string>) =>
  simulate.calculateUtilizationRate(reserve);
export const calculateUtilizationPercent = (reserve: Reserve<string>) =>
  simulate.calculateUtilizationPercent(reserve);

/**
 * @deprecated since version 1.0.8. Use `calculateBorrowAprPercent` instead.
 */
export const calculateBorrowApr = (reserve: Reserve<string>) =>
  simulate.calculateBorrowApr(reserve);
export const calculateBorrowAprPercent = (reserve: Reserve<string>) =>
  simulate.calculateBorrowAprPercent(reserve);

/**
 * @deprecated since version 1.0.8. Use `calculateDepositAprPercent` instead.
 */
export const calculateSupplyApr = (reserve: Reserve<string>) =>
  simulate.calculateSupplyApr(reserve);
export const calculateDepositAprPercent = (reserve: Reserve<string>) =>
  simulate.calculateDepositAprPercent(reserve);

export const compoundReserveInterest = (
  reserve: Reserve<string>,
  now: number,
): Reserve<string> => simulate.compoundReserveInterest(reserve, now);

export const updatePoolRewardsManager = (
  manager: PoolRewardManager,
  nowMs: number,
): PoolRewardManager => simulate.updatePoolRewardsManager(manager, nowMs);

export const refreshReservePrice = async (
  reserves: Reserve<string>[],
  pythConnection: SuiPriceServiceConnection,
): Promise<Reserve<string>[]> =>
  simulate.refreshReservePrice(reserves, pythConnection);

export const updateUserRewardManager = (
  poolManager: PoolRewardManager,
  userRewardManager: UserRewardManager,
  now: number,
): UserRewardManager =>
  simulate.updateUserRewardManager(poolManager, userRewardManager, now);

export const refreshObligation = (
  unrefreshedObligation: Obligation<string>,
  refreshedReserves: Reserve<string>[],
): Obligation<string> =>
  simulate.refreshObligation(unrefreshedObligation, refreshedReserves);

export const numberToDecimal = (value: number): Decimal =>
  simulate.numberToDecimal(value);

export const stringToDecimal = (value: string): Decimal =>
  simulate.stringToDecimal(value);

export const decimalToBigNumber = (value: Decimal) =>
  simulate.decimalToBigNumber(value);

export const getCTokenMarketValue = (
  reserve: Reserve<string>,
  depositedCTokenAmount: BigNumber,
): BigNumber => simulate.getCTokenMarketValue(reserve, depositedCTokenAmount);

export const getCTokenMarketValueLowerBound = (
  reserve: Reserve<string>,
  depositedCTokenAmount: BigNumber,
): BigNumber =>
  simulate.getCTokenMarketValueLowerBound(reserve, depositedCTokenAmount);

export const cTokenRatio = (reserve: Reserve<string>) =>
  simulate.cTokenRatio(reserve);

export const totalSupply = (reserve: Reserve<string>) =>
  simulate.totalSupply(reserve);

export const compoundDebt = (
  borrow: Borrow,
  reserve: Reserve<string>,
): Borrow => simulate.compoundDebt(borrow, reserve);
