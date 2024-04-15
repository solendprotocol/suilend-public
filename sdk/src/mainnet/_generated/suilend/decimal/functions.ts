import { PUBLISHED_AT } from "..";
import { ObjectArg, obj, pure } from "../../_framework/util";
import {
  TransactionArgument,
  TransactionBlock,
} from "@mysten/sui.js/transactions";

export interface MaxArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function max(txb: TransactionBlock, args: MaxArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::max`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export interface MinArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function min(txb: TransactionBlock, args: MinArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::min`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export interface PowArgs {
  b: ObjectArg;
  e: bigint | TransactionArgument;
}

export function pow(txb: TransactionBlock, args: PowArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::pow`,
    arguments: [obj(txb, args.b), pure(txb, args.e, `u64`)],
  });
}

export interface AddArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function add(txb: TransactionBlock, args: AddArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::add`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export interface DivArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function div(txb: TransactionBlock, args: DivArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::div`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export interface MulArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function mul(txb: TransactionBlock, args: MulArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::mul`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export interface SubArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function sub(txb: TransactionBlock, args: SubArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::sub`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export function from(txb: TransactionBlock, v: bigint | TransactionArgument) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::from`,
    arguments: [pure(txb, v, `u64`)],
  });
}

export function ceil(txb: TransactionBlock, a: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::ceil`,
    arguments: [obj(txb, a)],
  });
}

export interface EqArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function eq(txb: TransactionBlock, args: EqArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::eq`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export function floor(txb: TransactionBlock, a: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::floor`,
    arguments: [obj(txb, a)],
  });
}

export function fromBps(
  txb: TransactionBlock,
  v: bigint | TransactionArgument,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::from_bps`,
    arguments: [pure(txb, v, `u64`)],
  });
}

export function fromPercent(
  txb: TransactionBlock,
  v: number | TransactionArgument,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::from_percent`,
    arguments: [pure(txb, v, `u8`)],
  });
}

export function fromPercentU64(
  txb: TransactionBlock,
  v: bigint | TransactionArgument,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::from_percent_u64`,
    arguments: [pure(txb, v, `u64`)],
  });
}

export function fromScaledVal(
  txb: TransactionBlock,
  v: bigint | TransactionArgument,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::from_scaled_val`,
    arguments: [pure(txb, v, `u256`)],
  });
}

export interface GeArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function ge(txb: TransactionBlock, args: GeArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::ge`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export interface GtArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function gt(txb: TransactionBlock, args: GtArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::gt`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export interface LeArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function le(txb: TransactionBlock, args: LeArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::le`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export interface LtArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function lt(txb: TransactionBlock, args: LtArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::lt`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export interface SaturatingSubArgs {
  a: ObjectArg;
  b: ObjectArg;
}

export function saturatingSub(txb: TransactionBlock, args: SaturatingSubArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::saturating_sub`,
    arguments: [obj(txb, args.a), obj(txb, args.b)],
  });
}

export function toScaledVal(txb: TransactionBlock, v: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::decimal::to_scaled_val`,
    arguments: [obj(txb, v)],
  });
}
