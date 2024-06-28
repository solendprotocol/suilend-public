import { PUBLISHED_AT } from "..";
import { ID } from "../../_dependencies/source/0x2/object/structs";
import { obj, pure, vector } from "../../_framework/util";
import { Reserve } from "../reserve/structs";
import {
  Transaction,
  TransactionArgument,
  TransactionObjectInput,
} from "@mysten/sui/transactions";

export interface BorrowArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
  clock: TransactionObjectInput;
  amount: bigint | TransactionArgument;
}

export function borrow(tx: Transaction, typeArg: string, args: BorrowArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::borrow`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.reserve),
      obj(tx, args.clock),
      pure(tx, args.amount, `u64`),
    ],
  });
}

export interface WithdrawArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
  clock: TransactionObjectInput;
  ctokenAmount: bigint | TransactionArgument;
}

export function withdraw(tx: Transaction, typeArg: string, args: WithdrawArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::withdraw`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.reserve),
      obj(tx, args.clock),
      pure(tx, args.ctokenAmount, `u64`),
    ],
  });
}

export interface DepositArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
  clock: TransactionObjectInput;
  ctokenAmount: bigint | TransactionArgument;
}

export function deposit(tx: Transaction, typeArg: string, args: DepositArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::deposit`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.reserve),
      obj(tx, args.clock),
      pure(tx, args.ctokenAmount, `u64`),
    ],
  });
}

export interface ClaimRewardsArgs {
  obligation: TransactionObjectInput;
  poolRewardManager: TransactionObjectInput;
  clock: TransactionObjectInput;
  rewardIndex: bigint | TransactionArgument;
}

export function claimRewards(
  tx: Transaction,
  typeArgs: [string, string],
  args: ClaimRewardsArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::claim_rewards`,
    typeArguments: typeArgs,
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.poolRewardManager),
      obj(tx, args.clock),
      pure(tx, args.rewardIndex, `u64`),
    ],
  });
}

export function borrowedAmount(
  tx: Transaction,
  typeArgs: [string, string],
  obligation: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::borrowed_amount`,
    typeArguments: typeArgs,
    arguments: [obj(tx, obligation)],
  });
}

export interface MaxBorrowAmountArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
}

export function maxBorrowAmount(
  tx: Transaction,
  typeArg: string,
  args: MaxBorrowAmountArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::max_borrow_amount`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.obligation), obj(tx, args.reserve)],
  });
}

export interface CompoundDebtArgs {
  borrow: TransactionObjectInput;
  reserve: TransactionObjectInput;
}

export function compoundDebt(
  tx: Transaction,
  typeArg: string,
  args: CompoundDebtArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::compound_debt`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.borrow), obj(tx, args.reserve)],
  });
}

export function createObligation(
  tx: Transaction,
  typeArg: string,
  lendingMarketId: string | TransactionArgument,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::create_obligation`,
    typeArguments: [typeArg],
    arguments: [pure(tx, lendingMarketId, `${ID.$typeName}`)],
  });
}

export function depositedCtokenAmount(
  tx: Transaction,
  typeArgs: [string, string],
  obligation: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::deposited_ctoken_amount`,
    typeArguments: typeArgs,
    arguments: [obj(tx, obligation)],
  });
}

export interface FindBorrowArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
}

export function findBorrow(
  tx: Transaction,
  typeArg: string,
  args: FindBorrowArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_borrow`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.obligation), obj(tx, args.reserve)],
  });
}

export interface FindBorrowIndexArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
}

export function findBorrowIndex(
  tx: Transaction,
  typeArg: string,
  args: FindBorrowIndexArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_borrow_index`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.obligation), obj(tx, args.reserve)],
  });
}

export interface FindDepositArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
}

export function findDeposit(
  tx: Transaction,
  typeArg: string,
  args: FindDepositArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_deposit`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.obligation), obj(tx, args.reserve)],
  });
}

export interface FindDepositIndexArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
}

export function findDepositIndex(
  tx: Transaction,
  typeArg: string,
  args: FindDepositIndexArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_deposit_index`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.obligation), obj(tx, args.reserve)],
  });
}

export interface FindOrAddBorrowArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
  clock: TransactionObjectInput;
}

export function findOrAddBorrow(
  tx: Transaction,
  typeArg: string,
  args: FindOrAddBorrowArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_or_add_borrow`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.reserve),
      obj(tx, args.clock),
    ],
  });
}

export interface FindOrAddDepositArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
  clock: TransactionObjectInput;
}

export function findOrAddDeposit(
  tx: Transaction,
  typeArg: string,
  args: FindOrAddDepositArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_or_add_deposit`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.reserve),
      obj(tx, args.clock),
    ],
  });
}

export interface FindOrAddUserRewardManagerArgs {
  obligation: TransactionObjectInput;
  poolRewardManager: TransactionObjectInput;
  clock: TransactionObjectInput;
}

export function findOrAddUserRewardManager(
  tx: Transaction,
  typeArg: string,
  args: FindOrAddUserRewardManagerArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_or_add_user_reward_manager`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.poolRewardManager),
      obj(tx, args.clock),
    ],
  });
}

export interface FindUserRewardManagerIndexArgs {
  obligation: TransactionObjectInput;
  poolRewardManager: TransactionObjectInput;
}

export function findUserRewardManagerIndex(
  tx: Transaction,
  typeArg: string,
  args: FindUserRewardManagerIndexArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::find_user_reward_manager_index`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.obligation), obj(tx, args.poolRewardManager)],
  });
}

export interface ForgiveArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
  clock: TransactionObjectInput;
  maxForgiveAmount: TransactionObjectInput;
}

export function forgive(tx: Transaction, typeArg: string, args: ForgiveArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::forgive`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.reserve),
      obj(tx, args.clock),
      obj(tx, args.maxForgiveAmount),
    ],
  });
}

export function isForgivable(
  tx: Transaction,
  typeArg: string,
  obligation: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::is_forgivable`,
    typeArguments: [typeArg],
    arguments: [obj(tx, obligation)],
  });
}

export function isHealthy(
  tx: Transaction,
  typeArg: string,
  obligation: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::is_healthy`,
    typeArguments: [typeArg],
    arguments: [obj(tx, obligation)],
  });
}

export function isLiquidatable(
  tx: Transaction,
  typeArg: string,
  obligation: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::is_liquidatable`,
    typeArguments: [typeArg],
    arguments: [obj(tx, obligation)],
  });
}

export function liabilityShares(
  tx: Transaction,
  borrow: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::liability_shares`,
    arguments: [obj(tx, borrow)],
  });
}

export interface LiquidateArgs {
  obligation: TransactionObjectInput;
  reserves: Array<TransactionObjectInput> | TransactionArgument;
  repayReserveArrayIndex: bigint | TransactionArgument;
  withdrawReserveArrayIndex: bigint | TransactionArgument;
  clock: TransactionObjectInput;
  repayAmount: bigint | TransactionArgument;
}

export function liquidate(
  tx: Transaction,
  typeArg: string,
  args: LiquidateArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::liquidate`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      vector(tx, `${Reserve.$typeName}<${typeArg}>`, args.reserves),
      pure(tx, args.repayReserveArrayIndex, `u64`),
      pure(tx, args.withdrawReserveArrayIndex, `u64`),
      obj(tx, args.clock),
      pure(tx, args.repayAmount, `u64`),
    ],
  });
}

export function logObligationData(
  tx: Transaction,
  typeArg: string,
  obligation: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::log_obligation_data`,
    typeArguments: [typeArg],
    arguments: [obj(tx, obligation)],
  });
}

export interface MaxWithdrawAmountArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
}

export function maxWithdrawAmount(
  tx: Transaction,
  typeArg: string,
  args: MaxWithdrawAmountArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::max_withdraw_amount`,
    typeArguments: [typeArg],
    arguments: [obj(tx, args.obligation), obj(tx, args.reserve)],
  });
}

export interface RefreshArgs {
  obligation: TransactionObjectInput;
  reserves: Array<TransactionObjectInput> | TransactionArgument;
  clock: TransactionObjectInput;
}

export function refresh(tx: Transaction, typeArg: string, args: RefreshArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::refresh`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      vector(tx, `${Reserve.$typeName}<${typeArg}>`, args.reserves),
      obj(tx, args.clock),
    ],
  });
}

export interface RepayArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
  clock: TransactionObjectInput;
  maxRepayAmount: TransactionObjectInput;
}

export function repay(tx: Transaction, typeArg: string, args: RepayArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::repay`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.reserve),
      obj(tx, args.clock),
      obj(tx, args.maxRepayAmount),
    ],
  });
}

export interface WithdrawUncheckedArgs {
  obligation: TransactionObjectInput;
  reserve: TransactionObjectInput;
  clock: TransactionObjectInput;
  ctokenAmount: bigint | TransactionArgument;
}

export function withdrawUnchecked(
  tx: Transaction,
  typeArg: string,
  args: WithdrawUncheckedArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::obligation::withdraw_unchecked`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.obligation),
      obj(tx, args.reserve),
      obj(tx, args.clock),
      pure(tx, args.ctokenAmount, `u64`),
    ],
  });
}
