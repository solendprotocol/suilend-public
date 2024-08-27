import { PUBLISHED_AT } from "..";
import { ObjectArg, obj, pure } from "../../_framework/util";
import {
  TransactionArgument,
  TransactionBlock,
} from "@mysten/sui.js/transactions";

export interface NewArgs {
  config: ObjectArg;
  curTime: bigint | TransactionArgument;
}

export function new_(txb: TransactionBlock, args: NewArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::new`,
    arguments: [obj(txb, args.config), pure(txb, args.curTime, `u64`)],
  });
}

export interface CurrentOutflowArgs {
  rateLimiter: ObjectArg;
  curTime: bigint | TransactionArgument;
}

export function currentOutflow(
  txb: TransactionBlock,
  args: CurrentOutflowArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::current_outflow`,
    arguments: [obj(txb, args.rateLimiter), pure(txb, args.curTime, `u64`)],
  });
}

export interface NewConfigArgs {
  windowDuration: bigint | TransactionArgument;
  maxOutflow: bigint | TransactionArgument;
}

export function newConfig(txb: TransactionBlock, args: NewConfigArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::new_config`,
    arguments: [
      pure(txb, args.windowDuration, `u64`),
      pure(txb, args.maxOutflow, `u64`),
    ],
  });
}

export interface ProcessQtyArgs {
  rateLimiter: ObjectArg;
  curTime: bigint | TransactionArgument;
  qty: ObjectArg;
}

export function processQty(txb: TransactionBlock, args: ProcessQtyArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::process_qty`,
    arguments: [
      obj(txb, args.rateLimiter),
      pure(txb, args.curTime, `u64`),
      obj(txb, args.qty),
    ],
  });
}

export interface RemainingOutflowArgs {
  rateLimiter: ObjectArg;
  curTime: bigint | TransactionArgument;
}

export function remainingOutflow(
  txb: TransactionBlock,
  args: RemainingOutflowArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::remaining_outflow`,
    arguments: [obj(txb, args.rateLimiter), pure(txb, args.curTime, `u64`)],
  });
}

export interface UpdateInternalArgs {
  rateLimiter: ObjectArg;
  curTime: bigint | TransactionArgument;
}

export function updateInternal(
  txb: TransactionBlock,
  args: UpdateInternalArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::update_internal`,
    arguments: [obj(txb, args.rateLimiter), pure(txb, args.curTime, `u64`)],
  });
}
