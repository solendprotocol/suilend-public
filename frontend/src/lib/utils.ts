import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hoverUnderlineClassName =
  "underline decoration-dotted decoration-1 underline-offset-2";

export const reserveSort = (a: ParsedReserve, b: ParsedReserve) =>
  Number(a.arrayIndex) - Number(b.arrayIndex);
