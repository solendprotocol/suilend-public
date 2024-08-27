import { PUBLISHED_AT } from "..";
import { ObjectArg, obj } from "../../_framework/util";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export interface GetPythPriceAndIdentifierArgs {
  priceInfoObj: ObjectArg;
  clock: ObjectArg;
}

export function getPythPriceAndIdentifier(
  txb: TransactionBlock,
  args: GetPythPriceAndIdentifierArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::oracles::get_pyth_price_and_identifier`,
    arguments: [obj(txb, args.priceInfoObj), obj(txb, args.clock)],
  });
}

export function parsePriceToDecimal(txb: TransactionBlock, price: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::oracles::parse_price_to_decimal`,
    arguments: [obj(txb, price)],
  });
}
