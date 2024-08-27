import { PUBLISHED_AT } from "..";
import { GenericArg, ObjectArg, generic, obj } from "../../_framework/util";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export function new_(
  txb: TransactionBlock,
  typeArg: string,
  element: GenericArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::cell::new`,
    typeArguments: [typeArg],
    arguments: [generic(txb, `${typeArg}`, element)],
  });
}

export interface SetArgs {
  cell: ObjectArg;
  element: GenericArg;
}

export function set(txb: TransactionBlock, typeArg: string, args: SetArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::cell::set`,
    typeArguments: [typeArg],
    arguments: [obj(txb, args.cell), generic(txb, `${typeArg}`, args.element)],
  });
}

export function get(txb: TransactionBlock, typeArg: string, cell: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::cell::get`,
    typeArguments: [typeArg],
    arguments: [obj(txb, cell)],
  });
}

export function destroy(
  txb: TransactionBlock,
  typeArg: string,
  cell: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::cell::destroy`,
    typeArguments: [typeArg],
    arguments: [obj(txb, cell)],
  });
}
