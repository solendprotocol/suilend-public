import { PUBLISHED_AT } from "..";
import { obj } from "../../_framework/util";
import { Transaction, TransactionObjectInput } from "@mysten/sui/transactions";

export interface GetPythPriceAndIdentifierArgs {
  priceInfoObj: TransactionObjectInput;
  clock: TransactionObjectInput;
}

export function getPythPriceAndIdentifier(
  tx: Transaction,
  args: GetPythPriceAndIdentifierArgs,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::oracles::get_pyth_price_and_identifier`,
    arguments: [obj(tx, args.priceInfoObj), obj(tx, args.clock)],
  });
}

export function parsePriceToDecimal(
  tx: Transaction,
  price: TransactionObjectInput,
) {
  return tx.moveCall({
    target: `${PUBLISHED_AT}::oracles::parse_price_to_decimal`,
    arguments: [obj(tx, price)],
  });
}
