import { PUBLISHED_AT } from "..";
import { ObjectArg, obj, pure } from "../../_framework/util";
import {
  TransactionArgument,
  TransactionBlock,
} from "@mysten/sui.js/transactions";

export function totalSupply(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::total_supply`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function price(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::price`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function config(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::config`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function coinType(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::coin_type`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function arrayIndex(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::array_index`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export interface AssertPriceIsFreshArgs {
  reserve: ObjectArg;
  clock: ObjectArg;
}

export function assertPriceIsFresh(
  txb: TransactionBlock,
  typeArg: string,
  args: AssertPriceIsFreshArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::assert_price_is_fresh`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), obj(txb, args.clock)],
  });
}

export function availableAmount(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::available_amount`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export interface BorrowLiquidityArgs {
  reserve: ObjectArg;
  amount: bigint | TransactionArgument;
}

export function borrowLiquidity(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: BorrowLiquidityArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::borrow_liquidity`,
    typeArguments: typeArgs,
    arguments: [obj(txb, args.reserve), pure(txb, args.amount, `u64`)],
  });
}

export function borrowedAmount(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::borrowed_amount`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function borrowsPoolRewardManager(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::borrows_pool_reward_manager`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function borrowsPoolRewardManagerMut(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::borrows_pool_reward_manager_mut`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export interface CalculateBorrowFeeArgs {
  reserve: ObjectArg;
  borrowAmount: bigint | TransactionArgument;
}

export function calculateBorrowFee(
  txb: TransactionBlock,
  typeArg: string,
  args: CalculateBorrowFeeArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::calculate_borrow_fee`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), pure(txb, args.borrowAmount, `u64`)],
  });
}

export function calculateUtilizationRate(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::calculate_utilization_rate`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function claimFees(
  txb: TransactionBlock,
  typeArgs: [string, string],
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::claim_fees`,
    typeArguments: typeArgs,
    arguments: [obj(txb, reserve)],
  });
}

export interface CompoundInterestArgs {
  reserve: ObjectArg;
  clock: ObjectArg;
}

export function compoundInterest(
  txb: TransactionBlock,
  typeArg: string,
  args: CompoundInterestArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::compound_interest`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), obj(txb, args.clock)],
  });
}

export interface CreateReserveArgs {
  lendingMarketId: string | TransactionArgument;
  config: ObjectArg;
  arrayIndex: bigint | TransactionArgument;
  coinMetadata: ObjectArg;
  priceInfoObj: ObjectArg;
  clock: ObjectArg;
}

export function createReserve(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: CreateReserveArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::create_reserve`,
    typeArguments: typeArgs,
    arguments: [
      pure(txb, args.lendingMarketId, `0x2::object::ID`),
      obj(txb, args.config),
      pure(txb, args.arrayIndex, `u64`),
      obj(txb, args.coinMetadata),
      obj(txb, args.priceInfoObj),
      obj(txb, args.clock),
    ],
  });
}

export interface CtokenMarketValueArgs {
  reserve: ObjectArg;
  ctokenAmount: bigint | TransactionArgument;
}

export function ctokenMarketValue(
  txb: TransactionBlock,
  typeArg: string,
  args: CtokenMarketValueArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::ctoken_market_value`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), pure(txb, args.ctokenAmount, `u64`)],
  });
}

export interface CtokenMarketValueLowerBoundArgs {
  reserve: ObjectArg;
  ctokenAmount: bigint | TransactionArgument;
}

export function ctokenMarketValueLowerBound(
  txb: TransactionBlock,
  typeArg: string,
  args: CtokenMarketValueLowerBoundArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::ctoken_market_value_lower_bound`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), pure(txb, args.ctokenAmount, `u64`)],
  });
}

export interface CtokenMarketValueUpperBoundArgs {
  reserve: ObjectArg;
  ctokenAmount: bigint | TransactionArgument;
}

export function ctokenMarketValueUpperBound(
  txb: TransactionBlock,
  typeArg: string,
  args: CtokenMarketValueUpperBoundArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::ctoken_market_value_upper_bound`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), pure(txb, args.ctokenAmount, `u64`)],
  });
}

export function ctokenRatio(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::ctoken_ratio`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function cumulativeBorrowRate(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::cumulative_borrow_rate`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export interface DeductLiquidationFeeArgs {
  reserve: ObjectArg;
  ctokens: ObjectArg;
}

export function deductLiquidationFee(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: DeductLiquidationFeeArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::deduct_liquidation_fee`,
    typeArguments: typeArgs,
    arguments: [obj(txb, args.reserve), obj(txb, args.ctokens)],
  });
}

export interface DepositCtokensArgs {
  reserve: ObjectArg;
  ctokens: ObjectArg;
}

export function depositCtokens(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: DepositCtokensArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::deposit_ctokens`,
    typeArguments: typeArgs,
    arguments: [obj(txb, args.reserve), obj(txb, args.ctokens)],
  });
}

export interface DepositLiquidityAndMintCtokensArgs {
  reserve: ObjectArg;
  liquidity: ObjectArg;
}

export function depositLiquidityAndMintCtokens(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: DepositLiquidityAndMintCtokensArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::deposit_liquidity_and_mint_ctokens`,
    typeArguments: typeArgs,
    arguments: [obj(txb, args.reserve), obj(txb, args.liquidity)],
  });
}

export function depositsPoolRewardManager(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::deposits_pool_reward_manager`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function depositsPoolRewardManagerMut(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::deposits_pool_reward_manager_mut`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export interface ForgiveDebtArgs {
  reserve: ObjectArg;
  forgiveAmount: ObjectArg;
}

export function forgiveDebt(
  txb: TransactionBlock,
  typeArg: string,
  args: ForgiveDebtArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::forgive_debt`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), obj(txb, args.forgiveAmount)],
  });
}

export function logReserveData(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::log_reserve_data`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export interface MarketValueArgs {
  reserve: ObjectArg;
  liquidityAmount: ObjectArg;
}

export function marketValue(
  txb: TransactionBlock,
  typeArg: string,
  args: MarketValueArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::market_value`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), obj(txb, args.liquidityAmount)],
  });
}

export interface MarketValueLowerBoundArgs {
  reserve: ObjectArg;
  liquidityAmount: ObjectArg;
}

export function marketValueLowerBound(
  txb: TransactionBlock,
  typeArg: string,
  args: MarketValueLowerBoundArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::market_value_lower_bound`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), obj(txb, args.liquidityAmount)],
  });
}

export interface MarketValueUpperBoundArgs {
  reserve: ObjectArg;
  liquidityAmount: ObjectArg;
}

export function marketValueUpperBound(
  txb: TransactionBlock,
  typeArg: string,
  args: MarketValueUpperBoundArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::market_value_upper_bound`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), obj(txb, args.liquidityAmount)],
  });
}

export function maxBorrowAmount(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::max_borrow_amount`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function maxRedeemAmount(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::max_redeem_amount`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function priceLowerBound(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::price_lower_bound`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export function priceUpperBound(
  txb: TransactionBlock,
  typeArg: string,
  reserve: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::price_upper_bound`,
    typeArguments: [typeArg],
    arguments: [obj(txb, reserve)],
  });
}

export interface RedeemCtokensArgs {
  reserve: ObjectArg;
  ctokens: ObjectArg;
}

export function redeemCtokens(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: RedeemCtokensArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::redeem_ctokens`,
    typeArguments: typeArgs,
    arguments: [obj(txb, args.reserve), obj(txb, args.ctokens)],
  });
}

export interface RepayLiquidityArgs {
  reserve: ObjectArg;
  liquidity: ObjectArg;
  settleAmount: ObjectArg;
}

export function repayLiquidity(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: RepayLiquidityArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::repay_liquidity`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.reserve),
      obj(txb, args.liquidity),
      obj(txb, args.settleAmount),
    ],
  });
}

export interface UpdatePriceArgs {
  reserve: ObjectArg;
  clock: ObjectArg;
  priceInfoObj: ObjectArg;
}

export function updatePrice(
  txb: TransactionBlock,
  typeArg: string,
  args: UpdatePriceArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::update_price`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.reserve),
      obj(txb, args.clock),
      obj(txb, args.priceInfoObj),
    ],
  });
}

export interface UpdateReserveConfigArgs {
  reserve: ObjectArg;
  config: ObjectArg;
}

export function updateReserveConfig(
  txb: TransactionBlock,
  typeArg: string,
  args: UpdateReserveConfigArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::update_reserve_config`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), obj(txb, args.config)],
  });
}

export interface UsdToTokenAmountLowerBoundArgs {
  reserve: ObjectArg;
  usdAmount: ObjectArg;
}

export function usdToTokenAmountLowerBound(
  txb: TransactionBlock,
  typeArg: string,
  args: UsdToTokenAmountLowerBoundArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::usd_to_token_amount_lower_bound`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), obj(txb, args.usdAmount)],
  });
}

export interface UsdToTokenAmountUpperBoundArgs {
  reserve: ObjectArg;
  usdAmount: ObjectArg;
}

export function usdToTokenAmountUpperBound(
  txb: TransactionBlock,
  typeArg: string,
  args: UsdToTokenAmountUpperBoundArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::usd_to_token_amount_upper_bound`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.reserve), obj(txb, args.usdAmount)],
  });
}

export interface WithdrawCtokensArgs {
  reserve: ObjectArg;
  amount: bigint | TransactionArgument;
}

export function withdrawCtokens(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: WithdrawCtokensArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve::withdraw_ctokens`,
    typeArguments: typeArgs,
    arguments: [obj(txb, args.reserve), pure(txb, args.amount, `u64`)],
  });
}
