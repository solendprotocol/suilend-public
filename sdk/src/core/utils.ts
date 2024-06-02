import BigNumber from "bignumber.js";

import { ParsedReserve } from "./parsers/reserve";

export const toHexString = (bytes: number[]) =>
  Array.from(bytes, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");

export const reserveSort = (a: ParsedReserve, b: ParsedReserve) =>
  Number(a?.arrayIndex ?? 0) - Number(b?.arrayIndex ?? 0);

export const linearlyInterpolate = (
  array: any[],
  xKey: string,
  yKey: string,
  _xValue: number | BigNumber,
) => {
  let i = 1;
  while (i < array.length) {
    const leftXValue = new BigNumber(array[i - 1][xKey]);
    const leftYValue = new BigNumber(array[i - 1][yKey]);

    const xValue = new BigNumber(_xValue);

    const rightXValue = new BigNumber(array[i][xKey]);
    const rightYValue = new BigNumber(array[i][yKey]);

    if (xValue.gte(leftXValue) && xValue.lte(rightXValue)) {
      const weight = new BigNumber(xValue.minus(leftXValue)).div(
        rightXValue.minus(leftXValue),
      );

      return leftYValue.plus(weight.times(rightYValue.minus(leftYValue)));
    }
    i = i + 1;
  }

  // Should never reach here
  return new BigNumber(0);
};
