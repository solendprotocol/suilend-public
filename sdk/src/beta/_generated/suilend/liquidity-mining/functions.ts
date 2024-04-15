import { PUBLISHED_AT } from "..";
import { ObjectArg, obj, pure } from "../../_framework/util";
import {
  TransactionArgument,
  TransactionBlock,
} from "@mysten/sui.js/transactions";

export interface AddPoolRewardArgs {
  poolRewardManager: ObjectArg;
  rewards: ObjectArg;
  startTimeMs: bigint | TransactionArgument;
  endTimeMs: bigint | TransactionArgument;
  clock: ObjectArg;
}

export function addPoolReward(
  txb: TransactionBlock,
  typeArg: string,
  args: AddPoolRewardArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::add_pool_reward`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.poolRewardManager),
      obj(txb, args.rewards),
      pure(txb, args.startTimeMs, `u64`),
      pure(txb, args.endTimeMs, `u64`),
      obj(txb, args.clock),
    ],
  });
}

export function endTimeMs(txb: TransactionBlock, poolReward: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::end_time_ms`,
    arguments: [obj(txb, poolReward)],
  });
}

export interface CancelPoolRewardArgs {
  poolRewardManager: ObjectArg;
  index: bigint | TransactionArgument;
  clock: ObjectArg;
}

export function cancelPoolReward(
  txb: TransactionBlock,
  typeArg: string,
  args: CancelPoolRewardArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::cancel_pool_reward`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.poolRewardManager),
      pure(txb, args.index, `u64`),
      obj(txb, args.clock),
    ],
  });
}

export interface ChangeUserRewardManagerShareArgs {
  poolRewardManager: ObjectArg;
  userRewardManager: ObjectArg;
  newShare: bigint | TransactionArgument;
  clock: ObjectArg;
}

export function changeUserRewardManagerShare(
  txb: TransactionBlock,
  args: ChangeUserRewardManagerShareArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::change_user_reward_manager_share`,
    arguments: [
      obj(txb, args.poolRewardManager),
      obj(txb, args.userRewardManager),
      pure(txb, args.newShare, `u64`),
      obj(txb, args.clock),
    ],
  });
}

export interface ClaimRewardsArgs {
  poolRewardManager: ObjectArg;
  userRewardManager: ObjectArg;
  clock: ObjectArg;
  rewardIndex: bigint | TransactionArgument;
}

export function claimRewards(
  txb: TransactionBlock,
  typeArg: string,
  args: ClaimRewardsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::claim_rewards`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.poolRewardManager),
      obj(txb, args.userRewardManager),
      obj(txb, args.clock),
      pure(txb, args.rewardIndex, `u64`),
    ],
  });
}

export interface ClosePoolRewardArgs {
  poolRewardManager: ObjectArg;
  index: bigint | TransactionArgument;
  clock: ObjectArg;
}

export function closePoolReward(
  txb: TransactionBlock,
  typeArg: string,
  args: ClosePoolRewardArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::close_pool_reward`,
    typeArguments: [typeArg],
    arguments: [
      obj(txb, args.poolRewardManager),
      pure(txb, args.index, `u64`),
      obj(txb, args.clock),
    ],
  });
}

export interface PoolRewardArgs {
  poolRewardManager: ObjectArg;
  index: bigint | TransactionArgument;
}

export function poolReward(txb: TransactionBlock, args: PoolRewardArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::pool_reward`,
    arguments: [obj(txb, args.poolRewardManager), pure(txb, args.index, `u64`)],
  });
}

export function findAvailableIndex(
  txb: TransactionBlock,
  poolRewardManager: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::find_available_index`,
    arguments: [obj(txb, poolRewardManager)],
  });
}

export function lastUpdateTimeMs(
  txb: TransactionBlock,
  userRewardManager: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::last_update_time_ms`,
    arguments: [obj(txb, userRewardManager)],
  });
}

export function newPoolRewardManager(txb: TransactionBlock) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::new_pool_reward_manager`,
    arguments: [],
  });
}

export interface NewUserRewardManagerArgs {
  poolRewardManager: ObjectArg;
  clock: ObjectArg;
}

export function newUserRewardManager(
  txb: TransactionBlock,
  args: NewUserRewardManagerArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::new_user_reward_manager`,
    arguments: [obj(txb, args.poolRewardManager), obj(txb, args.clock)],
  });
}

export interface PoolRewardIdArgs {
  poolRewardManager: ObjectArg;
  index: bigint | TransactionArgument;
}

export function poolRewardId(txb: TransactionBlock, args: PoolRewardIdArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::pool_reward_id`,
    arguments: [obj(txb, args.poolRewardManager), pure(txb, args.index, `u64`)],
  });
}

export function poolRewardManagerId(
  txb: TransactionBlock,
  userRewardManager: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::pool_reward_manager_id`,
    arguments: [obj(txb, userRewardManager)],
  });
}

export function shares(txb: TransactionBlock, userRewardManager: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::shares`,
    arguments: [obj(txb, userRewardManager)],
  });
}

export interface UpdatePoolRewardManagerArgs {
  poolRewardManager: ObjectArg;
  clock: ObjectArg;
}

export function updatePoolRewardManager(
  txb: TransactionBlock,
  args: UpdatePoolRewardManagerArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::update_pool_reward_manager`,
    arguments: [obj(txb, args.poolRewardManager), obj(txb, args.clock)],
  });
}

export interface UpdateUserRewardManagerArgs {
  poolRewardManager: ObjectArg;
  userRewardManager: ObjectArg;
  clock: ObjectArg;
}

export function updateUserRewardManager(
  txb: TransactionBlock,
  args: UpdateUserRewardManagerArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::liquidity_mining::update_user_reward_manager`,
    arguments: [
      obj(txb, args.poolRewardManager),
      obj(txb, args.userRewardManager),
      obj(txb, args.clock),
    ],
  });
}
