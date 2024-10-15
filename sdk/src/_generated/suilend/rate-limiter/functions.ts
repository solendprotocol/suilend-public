import { PUBLISHED_AT } from "..";
import { obj, pure } from "../../_framework/util";
import {
  Transaction,
  TransactionArgument,
  TransactionObjectInput,
} from "@mysten/sui/transactions";

export interface NewArgs {
  config: TransactionObjectInput;
  curTime: bigint | TransactionArgument;
}

export function new_(tx: Transaction, args: NewArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::new`,
    arguments: [obj(tx, args.config), pure(tx, args.curTime, `u64`)],
  });
}

export interface CurrentOutflowArgs {
  rateLimiter: TransactionObjectInput;
  curTime: bigint | TransactionArgument;
}

export function currentOutflow(tx: Transaction, args: CurrentOutflowArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::current_outflow`,
    arguments: [obj(tx, args.rateLimiter), pure(tx, args.curTime, `u64`)],
  });
}

export interface NewConfigArgs {
  windowDuration: bigint | TransactionArgument;
  maxOutflow: bigint | TransactionArgument;
}

export function newConfig(tx: Transaction, args: NewConfigArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::new_config`,
    arguments: [
      pure(tx, args.windowDuration, `u64`),
      pure(tx, args.maxOutflow, `u64`),
    ],
  });
}

export interface ProcessQtyArgs {
  rateLimiter: TransactionObjectInput;
  curTime: bigint | TransactionArgument;
  qty: TransactionObjectInput;
}

export function processQty(tx: Transaction, args: ProcessQtyArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::process_qty`,
    arguments: [
      obj(tx, args.rateLimiter),
      pure(tx, args.curTime, `u64`),
      obj(tx, args.qty),
    ],
  });
}

export interface RemainingOutflowArgs {
  rateLimiter: TransactionObjectInput;
  curTime: bigint | TransactionArgument;
}

export function remainingOutflow(tx: Transaction, args: RemainingOutflowArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::remaining_outflow`,
    arguments: [obj(tx, args.rateLimiter), pure(tx, args.curTime, `u64`)],
  });
}

export interface UpdateInternalArgs {
  rateLimiter: TransactionObjectInput;
  curTime: bigint | TransactionArgument;
}

export function updateInternal(tx: Transaction, args: UpdateInternalArgs) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::rate_limiter::update_internal`,
    arguments: [obj(tx, args.rateLimiter), pure(tx, args.curTime, `u64`)],
  });
}
