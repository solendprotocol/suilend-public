import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import {
  Transaction,
  TransactionArgument,
  TransactionObjectInput,
} from "@mysten/sui/transactions";

export interface AddPoolRewardArgs {
  poolRewardManager: TransactionObjectInput;
  rewards: TransactionObjectInput;
  startTimeMs: bigint | TransactionArgument;
  endTimeMs: bigint | TransactionArgument;
  clock: TransactionObjectInput;
}

export function addPoolReward(
  tx: Transaction,
  typeArg: string,
  args: AddPoolRewardArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::add_pool_reward`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.poolRewardManager),
      obj(tx, args.rewards),
      pure(tx, args.startTimeMs, `u64`),
      pure(tx, args.endTimeMs, `u64`),
      obj(tx, args.clock),
    ],
  });
}

export function endTimeMs(tx: Transaction, poolReward: TransactionObjectInput) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::end_time_ms`,
    arguments: [obj(tx, poolReward)],
  });
}

export interface CancelPoolRewardArgs {
  poolRewardManager: TransactionObjectInput;
  index: bigint | TransactionArgument;
  clock: TransactionObjectInput;
}

export function cancelPoolReward(
  tx: Transaction,
  typeArg: string,
  args: CancelPoolRewardArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::cancel_pool_reward`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.poolRewardManager),
      pure(tx, args.index, `u64`),
      obj(tx, args.clock),
    ],
  });
}

export interface ChangeUserRewardManagerShareArgs {
  poolRewardManager: TransactionObjectInput;
  userRewardManager: TransactionObjectInput;
  newShare: bigint | TransactionArgument;
  clock: TransactionObjectInput;
}

export function changeUserRewardManagerShare(
  tx: Transaction,
  args: ChangeUserRewardManagerShareArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::change_user_reward_manager_share`,
    arguments: [
      obj(tx, args.poolRewardManager),
      obj(tx, args.userRewardManager),
      pure(tx, args.newShare, `u64`),
      obj(tx, args.clock),
    ],
  });
}

export interface ClaimRewardsArgs {
  poolRewardManager: TransactionObjectInput;
  userRewardManager: TransactionObjectInput;
  clock: TransactionObjectInput;
  rewardIndex: bigint | TransactionArgument;
}

export function claimRewards(
  tx: Transaction,
  typeArg: string,
  args: ClaimRewardsArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::claim_rewards`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.poolRewardManager),
      obj(tx, args.userRewardManager),
      obj(tx, args.clock),
      pure(tx, args.rewardIndex, `u64`),
    ],
  });
}

export interface ClosePoolRewardArgs {
  poolRewardManager: TransactionObjectInput;
  index: bigint | TransactionArgument;
  clock: TransactionObjectInput;
}

export function closePoolReward(
  tx: Transaction,
  typeArg: string,
  args: ClosePoolRewardArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::close_pool_reward`,
    typeArguments: [typeArg],
    arguments: [
      obj(tx, args.poolRewardManager),
      pure(tx, args.index, `u64`),
      obj(tx, args.clock),
    ],
  });
}

export interface PoolRewardArgs {
  poolRewardManager: TransactionObjectInput;
  index: bigint | TransactionArgument;
}

export function poolReward(tx: Transaction, args: PoolRewardArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::pool_reward`,
    arguments: [obj(tx, args.poolRewardManager), pure(tx, args.index, `u64`)],
  });
}

export function findAvailableIndex(
  tx: Transaction,
  poolRewardManager: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::find_available_index`,
    arguments: [obj(tx, poolRewardManager)],
  });
}

export function lastUpdateTimeMs(
  tx: Transaction,
  userRewardManager: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::last_update_time_ms`,
    arguments: [obj(tx, userRewardManager)],
  });
}

export function newPoolRewardManager(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::new_pool_reward_manager`,
    arguments: [],
  });
}

export interface NewUserRewardManagerArgs {
  poolRewardManager: TransactionObjectInput;
  clock: TransactionObjectInput;
}

export function newUserRewardManager(
  tx: Transaction,
  args: NewUserRewardManagerArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::new_user_reward_manager`,
    arguments: [obj(tx, args.poolRewardManager), obj(tx, args.clock)],
  });
}

export interface PoolRewardIdArgs {
  poolRewardManager: TransactionObjectInput;
  index: bigint | TransactionArgument;
}

export function poolRewardId(tx: Transaction, args: PoolRewardIdArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::pool_reward_id`,
    arguments: [obj(tx, args.poolRewardManager), pure(tx, args.index, `u64`)],
  });
}

export function poolRewardManagerId(
  tx: Transaction,
  userRewardManager: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::pool_reward_manager_id`,
    arguments: [obj(tx, userRewardManager)],
  });
}

export function shares(
  tx: Transaction,
  userRewardManager: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::shares`,
    arguments: [obj(tx, userRewardManager)],
  });
}

export interface UpdatePoolRewardManagerArgs {
  poolRewardManager: TransactionObjectInput;
  clock: TransactionObjectInput;
}

export function updatePoolRewardManager(
  tx: Transaction,
  args: UpdatePoolRewardManagerArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::update_pool_reward_manager`,
    arguments: [obj(tx, args.poolRewardManager), obj(tx, args.clock)],
  });
}

export interface UpdateUserRewardManagerArgs {
  poolRewardManager: TransactionObjectInput;
  userRewardManager: TransactionObjectInput;
  clock: TransactionObjectInput;
}

export function updateUserRewardManager(
  tx: Transaction,
  args: UpdateUserRewardManagerArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::update_user_reward_manager`,
    arguments: [
      obj(tx, args.poolRewardManager),
      obj(tx, args.userRewardManager),
      obj(tx, args.clock),
    ],
  });
}
