import { PUBLISHED_AT } from "..";
import { ObjectArg, obj, option, pure } from "../../_framework/util";
import {
  TransactionArgument,
  TransactionBlock,
} from "@mysten/sui.js/transactions";

export interface BorrowArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationOwnerCap: ObjectArg;
  clock: ObjectArg;
  amount: bigint | TransactionArgument;
}

export function borrow(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: BorrowArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::borrow`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      obj(txb, args.obligationOwnerCap),
      obj(txb, args.clock),
      pure(txb, args.amount, `u64`),
    ],
  });
}

export interface MigrateArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
}

export function migrate(
  txb: TransactionBlock,
  typeArg: string,
  args: MigrateArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::migrate`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.lendingMarketOwnerCap),
      obj(txb, args.lendingMarket),
    ],
  });
}

export function init(txb: TransactionBlock, otw: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::init`,
    arguments: [obj(txb, otw)],
  });
}

export interface AddPoolRewardArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
  rewards: ObjectArg;
  startTimeMs: bigint | TransactionArgument;
  endTimeMs: bigint | TransactionArgument;
  clock: ObjectArg;
}

export function addPoolReward(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: AddPoolRewardArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::add_pool_reward`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarketOwnerCap),
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      pure(txb, args.isDepositReward, `bool`),
      obj(txb, args.rewards),
      pure(txb, args.startTimeMs, `u64`),
      pure(txb, args.endTimeMs, `u64`),
      obj(txb, args.clock),
    ],
  });
}

export interface CancelPoolRewardArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
  rewardIndex: bigint | TransactionArgument;
  clock: ObjectArg;
}

export function cancelPoolReward(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: CancelPoolRewardArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::cancel_pool_reward`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarketOwnerCap),
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      pure(txb, args.isDepositReward, `bool`),
      pure(txb, args.rewardIndex, `u64`),
      obj(txb, args.clock),
    ],
  });
}

export interface ClaimRewardsArgs {
  lendingMarket: ObjectArg;
  cap: ObjectArg;
  clock: ObjectArg;
  reserveId: bigint | TransactionArgument;
  rewardIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
}

export function claimRewards(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: ClaimRewardsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::claim_rewards`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      obj(txb, args.cap),
      obj(txb, args.clock),
      pure(txb, args.reserveId, `u64`),
      pure(txb, args.rewardIndex, `u64`),
      pure(txb, args.isDepositReward, `bool`),
    ],
  });
}

export interface ClosePoolRewardArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
  rewardIndex: bigint | TransactionArgument;
  clock: ObjectArg;
}

export function closePoolReward(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: ClosePoolRewardArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::close_pool_reward`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarketOwnerCap),
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      pure(txb, args.isDepositReward, `bool`),
      pure(txb, args.rewardIndex, `u64`),
      obj(txb, args.clock),
    ],
  });
}

export function reserve(
  txb: TransactionBlock,
  typeArgs: [string, string],
  lendingMarket: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::reserve`,
    typeArguments: typeArgs,
    arguments: [obj(txb, lendingMarket)],
  });
}

export interface ClaimFeesArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
}

export function claimFees(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: ClaimFeesArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::claim_fees`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
    ],
  });
}

export interface DepositLiquidityAndMintCtokensArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  clock: ObjectArg;
  deposit: ObjectArg;
}

export function depositLiquidityAndMintCtokens(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: DepositLiquidityAndMintCtokensArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::deposit_liquidity_and_mint_ctokens`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      obj(txb, args.clock),
      obj(txb, args.deposit),
    ],
  });
}

export interface MaxBorrowAmountArgs {
  rateLimiter: ObjectArg;
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
}

export function maxBorrowAmount(
  txb: TransactionBlock,
  typeArg: string,
  args: MaxBorrowAmountArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::max_borrow_amount`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.rateLimiter),
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
    ],
  });
}

export interface UpdateReserveConfigArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  config: ObjectArg;
}

export function updateReserveConfig(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: UpdateReserveConfigArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::update_reserve_config`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarketOwnerCap),
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      obj(txb, args.config),
    ],
  });
}

export interface WithdrawCtokensArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationOwnerCap: ObjectArg;
  clock: ObjectArg;
  amount: bigint | TransactionArgument;
}

export function withdrawCtokens(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: WithdrawCtokensArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::withdraw_ctokens`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      obj(txb, args.obligationOwnerCap),
      obj(txb, args.clock),
      pure(txb, args.amount, `u64`),
    ],
  });
}

export interface ObligationArgs {
  lendingMarket: ObjectArg;
  obligationId: string | TransactionArgument;
}

export function obligation(
  txb: TransactionBlock,
  typeArg: string,
  args: ObligationArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::obligation`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.obligationId, `0x2::object::ID`),
    ],
  });
}

export function createObligation(
  txb: TransactionBlock,
  typeArg: string,
  lendingMarket: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::create_obligation`,
    typeArguments: [typeArg],
    arguments: [obj(txb, lendingMarket)],
  });
}

export interface ForgiveArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationId: string | TransactionArgument;
  clock: ObjectArg;
  maxForgiveAmount: bigint | TransactionArgument;
}

export function forgive(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: ForgiveArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::forgive`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarketOwnerCap),
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      pure(txb, args.obligationId, `0x2::object::ID`),
      obj(txb, args.clock),
      pure(txb, args.maxForgiveAmount, `u64`),
    ],
  });
}

export interface LiquidateArgs {
  lendingMarket: ObjectArg;
  obligationId: string | TransactionArgument;
  repayReserveArrayIndex: bigint | TransactionArgument;
  withdrawReserveArrayIndex: bigint | TransactionArgument;
  clock: ObjectArg;
  repayCoins: ObjectArg;
}

export function liquidate(
  txb: TransactionBlock,
  typeArgs: [string, string, string],
  args: LiquidateArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::liquidate`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.obligationId, `0x2::object::ID`),
      pure(txb, args.repayReserveArrayIndex, `u64`),
      pure(txb, args.withdrawReserveArrayIndex, `u64`),
      obj(txb, args.clock),
      obj(txb, args.repayCoins),
    ],
  });
}

export interface MaxWithdrawAmountArgs {
  rateLimiter: ObjectArg;
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
}

export function maxWithdrawAmount(
  txb: TransactionBlock,
  typeArg: string,
  args: MaxWithdrawAmountArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::max_withdraw_amount`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.rateLimiter),
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
    ],
  });
}

export interface RepayArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationId: string | TransactionArgument;
  clock: ObjectArg;
  maxRepayCoins: ObjectArg;
}

export function repay(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: RepayArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::repay`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      pure(txb, args.obligationId, `0x2::object::ID`),
      obj(txb, args.clock),
      obj(txb, args.maxRepayCoins),
    ],
  });
}

export function reserveArrayIndex(
  txb: TransactionBlock,
  typeArgs: [string, string],
  lendingMarket: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::reserve_array_index`,
    typeArguments: typeArgs,
    arguments: [obj(txb, lendingMarket)],
  });
}

export function obligationId(
  txb: TransactionBlock,
  typeArg: string,
  cap: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::obligation_id`,
    typeArguments: [typeArg],
    arguments: [obj(txb, cap)],
  });
}

export interface AddReserveArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  priceInfo: ObjectArg;
  config: ObjectArg;
  coinMetadata: ObjectArg;
  clock: ObjectArg;
}

export function addReserve(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: AddReserveArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::add_reserve`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarketOwnerCap),
      obj(txb, args.lendingMarket),
      obj(txb, args.priceInfo),
      obj(txb, args.config),
      obj(txb, args.coinMetadata),
      obj(txb, args.clock),
    ],
  });
}

export interface ClaimRewardsAndDepositArgs {
  lendingMarket: ObjectArg;
  obligationId: string | TransactionArgument;
  clock: ObjectArg;
  rewardReserveId: bigint | TransactionArgument;
  rewardIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
  depositReserveId: bigint | TransactionArgument;
}

export function claimRewardsAndDeposit(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: ClaimRewardsAndDepositArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::claim_rewards_and_deposit`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.obligationId, `0x2::object::ID`),
      obj(txb, args.clock),
      pure(txb, args.rewardReserveId, `u64`),
      pure(txb, args.rewardIndex, `u64`),
      pure(txb, args.isDepositReward, `bool`),
      pure(txb, args.depositReserveId, `u64`),
    ],
  });
}

export interface ClaimRewardsByObligationIdArgs {
  lendingMarket: ObjectArg;
  obligationId: string | TransactionArgument;
  clock: ObjectArg;
  reserveId: bigint | TransactionArgument;
  rewardIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
  failIfRewardPeriodNotOver: boolean | TransactionArgument;
}

export function claimRewardsByObligationId(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: ClaimRewardsByObligationIdArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::claim_rewards_by_obligation_id`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.obligationId, `0x2::object::ID`),
      obj(txb, args.clock),
      pure(txb, args.reserveId, `u64`),
      pure(txb, args.rewardIndex, `u64`),
      pure(txb, args.isDepositReward, `bool`),
      pure(txb, args.failIfRewardPeriodNotOver, `bool`),
    ],
  });
}

export function createLendingMarket(txb: TransactionBlock, typeArg: string) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::create_lending_market`,
    typeArguments: [typeArg],
    arguments: [],
  });
}

export interface DepositCtokensIntoObligationArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationOwnerCap: ObjectArg;
  clock: ObjectArg;
  deposit: ObjectArg;
}

export function depositCtokensIntoObligation(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: DepositCtokensIntoObligationArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::deposit_ctokens_into_obligation`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      obj(txb, args.obligationOwnerCap),
      obj(txb, args.clock),
      obj(txb, args.deposit),
    ],
  });
}

export interface DepositCtokensIntoObligationByIdArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationId: string | TransactionArgument;
  clock: ObjectArg;
  deposit: ObjectArg;
}

export function depositCtokensIntoObligationById(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: DepositCtokensIntoObligationByIdArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::deposit_ctokens_into_obligation_by_id`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      pure(txb, args.obligationId, `0x2::object::ID`),
      obj(txb, args.clock),
      obj(txb, args.deposit),
    ],
  });
}

export interface RedeemCtokensAndWithdrawLiquidityArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  clock: ObjectArg;
  ctokens: ObjectArg;
  rateLimiterExemption: ObjectArg | TransactionArgument | null;
}

export function redeemCtokensAndWithdrawLiquidity(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: RedeemCtokensAndWithdrawLiquidityArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::redeem_ctokens_and_withdraw_liquidity`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      obj(txb, args.clock),
      obj(txb, args.ctokens),
      option(
        txb,
        `0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::lending_market::RateLimiterExemption<${typeArgs[0]}, ${typeArgs[1]}>`,
        args.rateLimiterExemption,
      ),
    ],
  });
}

export interface RefreshReservePriceArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  clock: ObjectArg;
  priceInfo: ObjectArg;
}

export function refreshReservePrice(
  txb: TransactionBlock,
  typeArg: string,
  args: RefreshReservePriceArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::refresh_reserve_price`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.lendingMarket),
      pure(txb, args.reserveArrayIndex, `u64`),
      obj(txb, args.clock),
      obj(txb, args.priceInfo),
    ],
  });
}

export interface UpdateRateLimiterConfigArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  clock: ObjectArg;
  config: ObjectArg;
}

export function updateRateLimiterConfig(
  txb: TransactionBlock,
  typeArg: string,
  args: UpdateRateLimiterConfigArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market::update_rate_limiter_config`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.lendingMarketOwnerCap),
      obj(txb, args.lendingMarket),
      obj(txb, args.clock),
      obj(txb, args.config),
    ],
  });
}
