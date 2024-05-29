import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hoverUnderlineClassName =
  "underline decoration-dotted decoration-1 underline-offset-2";

export const reserveSort = (a: ParsedReserve, b: ParsedReserve) =>
  Number(a?.arrayIndex ?? 0) - Number(b?.arrayIndex ?? 0);

export const linearlyInterpolate = (
  array: any[],
  xKey: string,
  yKey: string,
  xValue: number,
) => {
  let i = 1;
  while (i < array.length) {
    const left = array[i - 1];
    const right = array[i];

    if (xValue >= left[xKey] && xValue <= right[xKey]) {
      const weight = (xValue - left[xKey]) / (right[xKey] - left[xKey]);
      return left[yKey] + weight * (right[yKey] - left[yKey]);
    }
    i = i + 1;
  }

  // Should never reach here
  return 0;
};
