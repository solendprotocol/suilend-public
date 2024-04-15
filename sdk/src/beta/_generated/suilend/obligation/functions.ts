import { PUBLISHED_AT } from "..";
import { ObjectArg, obj, pure, vector } from "../../_framework/util";
import {
  TransactionArgument,
  TransactionBlock,
} from "@mysten/sui.js/transactions";

export interface BorrowArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
  amount: bigint | TransactionArgument;
}

export function borrow(
  txb: TransactionBlock,
  typeArg: string,
  args: BorrowArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::borrow`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
      pure(txb, args.amount, `u64`),
    ],
  });
}

export interface WithdrawArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
  ctokenAmount: bigint | TransactionArgument;
}

export function withdraw(
  txb: TransactionBlock,
  typeArg: string,
  args: WithdrawArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::withdraw`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
      pure(txb, args.ctokenAmount, `u64`),
    ],
  });
}

export interface DepositArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
  ctokenAmount: bigint | TransactionArgument;
}

export function deposit(
  txb: TransactionBlock,
  typeArg: string,
  args: DepositArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::deposit`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
      pure(txb, args.ctokenAmount, `u64`),
    ],
  });
}

export interface ClaimRewardsArgs {
  obligation: ObjectArg;
  poolRewardManager: ObjectArg;
  clock: ObjectArg;
  rewardIndex: bigint | TransactionArgument;
}

export function claimRewards(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: ClaimRewardsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::claim_rewards`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.poolRewardManager),
      obj(txb, args.clock),
      pure(txb, args.rewardIndex, `u64`),
    ],
  });
}

export function borrowedAmount(
  txb: TransactionBlock,
  typeArgs: [string, string],
  obligation: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::borrowed_amount`,
    typeArguments: typeArgs,
    arguments: [obj(txb, obligation)],
  });
}

export interface MaxBorrowAmountArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
}

export function maxBorrowAmount(
  txb: TransactionBlock,
  typeArg: string,
  args: MaxBorrowAmountArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::max_borrow_amount`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.obligation), obj(txb, args.reserve)],
  });
}

export interface CompoundDebtArgs {
  borrow: ObjectArg;
  reserve: ObjectArg;
}

export function compoundDebt(
  txb: TransactionBlock,
  typeArg: string,
  args: CompoundDebtArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::compound_debt`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.borrow), obj(txb, args.reserve)],
  });
}

export function createObligation(
  txb: TransactionBlock,
  typeArg: string,
  lendingMarketId: string | TransactionArgument,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::create_obligation`,
    typeArguments: [typeArg],
    arguments: [pure(txb, lendingMarketId, `0x2::object::ID`)],
  });
}

export function depositedCtokenAmount(
  txb: TransactionBlock,
  typeArgs: [string, string],
  obligation: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::deposited_ctoken_amount`,
    typeArguments: typeArgs,
    arguments: [obj(txb, obligation)],
  });
}

export interface FindBorrowArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
}

export function findBorrow(
  txb: TransactionBlock,
  typeArg: string,
  args: FindBorrowArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_borrow`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.obligation), obj(txb, args.reserve)],
  });
}

export interface FindBorrowIndexArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
}

export function findBorrowIndex(
  txb: TransactionBlock,
  typeArg: string,
  args: FindBorrowIndexArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_borrow_index`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.obligation), obj(txb, args.reserve)],
  });
}

export interface FindDepositArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
}

export function findDeposit(
  txb: TransactionBlock,
  typeArg: string,
  args: FindDepositArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_deposit`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.obligation), obj(txb, args.reserve)],
  });
}

export interface FindDepositIndexArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
}

export function findDepositIndex(
  txb: TransactionBlock,
  typeArg: string,
  args: FindDepositIndexArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_deposit_index`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.obligation), obj(txb, args.reserve)],
  });
}

export interface FindOrAddBorrowArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
}

export function findOrAddBorrow(
  txb: TransactionBlock,
  typeArg: string,
  args: FindOrAddBorrowArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_or_add_borrow`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
    ],
  });
}

export interface FindOrAddDepositArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
}

export function findOrAddDeposit(
  txb: TransactionBlock,
  typeArg: string,
  args: FindOrAddDepositArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_or_add_deposit`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
    ],
  });
}

export interface FindOrAddUserRewardManagerArgs {
  obligation: ObjectArg;
  poolRewardManager: ObjectArg;
  clock: ObjectArg;
}

export function findOrAddUserRewardManager(
  txb: TransactionBlock,
  typeArg: string,
  args: FindOrAddUserRewardManagerArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_or_add_user_reward_manager`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.poolRewardManager),
      obj(txb, args.clock),
    ],
  });
}

export interface FindUserRewardManagerIndexArgs {
  obligation: ObjectArg;
  poolRewardManager: ObjectArg;
}

export function findUserRewardManagerIndex(
  txb: TransactionBlock,
  typeArg: string,
  args: FindUserRewardManagerIndexArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_user_reward_manager_index`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.obligation), obj(txb, args.poolRewardManager)],
  });
}

export interface ForgiveArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
  maxForgiveAmount: ObjectArg;
}

export function forgive(
  txb: TransactionBlock,
  typeArg: string,
  args: ForgiveArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::forgive`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
      obj(txb, args.maxForgiveAmount),
    ],
  });
}

export function isForgivable(
  txb: TransactionBlock,
  typeArg: string,
  obligation: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::is_forgivable`,
    typeArguments: [typeArg],
    arguments: [obj(txb, obligation)],
  });
}

export function isHealthy(
  txb: TransactionBlock,
  typeArg: string,
  obligation: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::is_healthy`,
    typeArguments: [typeArg],
    arguments: [obj(txb, obligation)],
  });
}

export function isLiquidatable(
  txb: TransactionBlock,
  typeArg: string,
  obligation: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::is_liquidatable`,
    typeArguments: [typeArg],
    arguments: [obj(txb, obligation)],
  });
}

export function liabilityShares(txb: TransactionBlock, borrow: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::liability_shares`,
    arguments: [obj(txb, borrow)],
  });
}

export interface LiquidateArgs {
  obligation: ObjectArg;
  reserves: Array<ObjectArg> | TransactionArgument;
  repayReserveArrayIndex: bigint | TransactionArgument;
  withdrawReserveArrayIndex: bigint | TransactionArgument;
  clock: ObjectArg;
  repayAmount: bigint | TransactionArgument;
}

export function liquidate(
  txb: TransactionBlock,
  typeArg: string,
  args: LiquidateArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::liquidate`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      vector(
        txb,
        `0x9d5c964fda4247e0e191c5856bcdb7c96d19800c82d2a4a6e52740a64bc44625::reserve::Reserve<${typeArg}>`,
        args.reserves,
      ),
      pure(txb, args.repayReserveArrayIndex, `u64`),
      pure(txb, args.withdrawReserveArrayIndex, `u64`),
      obj(txb, args.clock),
      pure(txb, args.repayAmount, `u64`),
    ],
  });
}

export function logObligationData(
  txb: TransactionBlock,
  typeArg: string,
  obligation: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::log_obligation_data`,
    typeArguments: [typeArg],
    arguments: [obj(txb, obligation)],
  });
}

export interface MaxWithdrawAmountArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
}

export function maxWithdrawAmount(
  txb: TransactionBlock,
  typeArg: string,
  args: MaxWithdrawAmountArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::max_withdraw_amount`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.obligation), obj(txb, args.reserve)],
  });
}

export interface RefreshArgs {
  obligation: ObjectArg;
  reserves: Array<ObjectArg> | TransactionArgument;
  clock: ObjectArg;
}

export function refresh(
  txb: TransactionBlock,
  typeArg: string,
  args: RefreshArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::refresh`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      vector(
        txb,
        `0x9d5c964fda4247e0e191c5856bcdb7c96d19800c82d2a4a6e52740a64bc44625::reserve::Reserve<${typeArg}>`,
        args.reserves,
      ),
      obj(txb, args.clock),
    ],
  });
}

export interface RepayArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
  maxRepayAmount: ObjectArg;
}

export function repay(txb: TransactionBlock, typeArg: string, args: RepayArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::repay`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
      obj(txb, args.maxRepayAmount),
    ],
  });
}

export interface WithdrawUncheckedArgs {
  obligation: ObjectArg;
  reserve: ObjectArg;
  clock: ObjectArg;
  ctokenAmount: bigint | TransactionArgument;
}

export function withdrawUnchecked(
  txb: TransactionBlock,
  typeArg: string,
  args: WithdrawUncheckedArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::obligation::withdraw_unchecked`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.obligation),
      obj(txb, args.reserve),
      obj(txb, args.clock),
      pure(txb, args.ctokenAmount, `u64`),
    ],
  });
}
