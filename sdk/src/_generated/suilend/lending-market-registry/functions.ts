import { PUBLISHED_AT } from "..";
import { obj } from "../../_framework/util";
import { Transaction, TransactionObjectInput } from "@mysten/sui/transactions";

export function init(tx: Transaction) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::lending_market_registry::init`,
    arguments: [],
  });
}

export function createLendingMarket(
  tx: Transaction,
  typeArg: string,
  registry: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::lending_market_registry::create_lending_market`,
    typeArguments: [typeArg],
    arguments: [obj(tx, registry)],
  });
}
