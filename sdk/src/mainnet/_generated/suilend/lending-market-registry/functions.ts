import { PUBLISHED_AT } from "..";
import { ObjectArg, obj } from "../../_framework/util";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export function init(txb: TransactionBlock) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market_registry::init`,
    arguments: [],
  });
}

export function createLendingMarket(
  txb: TransactionBlock,
  typeArg: string,
  registry: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::lending_market_registry::create_lending_market`,
    typeArguments: [typeArg],
    arguments: [obj(txb, registry)],
  });
}
