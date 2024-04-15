import * as core from "../../core/parsers/obligation";
import { Obligation } from "../_generated/suilend/obligation/structs";

import { ParsedReserve } from "./reserve";

export type ParsedObligation = Omit<core.ParsedObligation, "original"> & {
  original: Obligation<string>;
};
export type ParsedPosition =
  | ParsedObligation["deposits"][0]
  | ParsedObligation["borrows"][0];

export const parseObligation = (
  obligation: Obligation<string>,
  parsedReserveMap: { [coinType: string]: ParsedReserve },
): ParsedObligation =>
  core.parseObligation(
    { Obligation: Obligation<string> },
    obligation,
    parsedReserveMap,
  ) as ParsedObligation;
