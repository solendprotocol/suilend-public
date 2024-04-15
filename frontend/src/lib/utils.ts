import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hoverUnderlineClassName =
  "underline decoration-dotted decoration-1 underline-offset-2";

export const sortInReserveOrder =
  (reserves: ParsedReserve[]) =>
  (aA: { reserve: ParsedReserve }, aB: { reserve: ParsedReserve }) => {
    const aAReserveIndex = reserves.findIndex((r) => r.id === aA.reserve.id);
    const aBReserveIndex = reserves.findIndex((r) => r.id === aB.reserve.id);
    return aAReserveIndex - aBReserveIndex;
  };
