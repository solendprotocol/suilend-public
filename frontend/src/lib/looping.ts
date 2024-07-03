import BigNumber from "bignumber.js";

import { AppData } from "@/contexts/AppContext";
import {
  NORMALIZED_USDC_COINTYPE,
  NORMALIZED_USDT_COINTYPE,
} from "@/lib/coinType";

export const LOOPING_THRESHOLD = 0.01;
export const LOOPING_MESSAGE =
  "You are looping (depositing and borrowing the same asset or USDT-USDC). Soon, looped positions will no longer be eligible for LM rewards. Please unloop to remain eligible.";

export const getLoopedAssetCoinTypes = (data: AppData) => {
  if (data.obligations === undefined || data.obligations.length === 0)
    return [];

  let result: string[][] = [];
  data.lendingMarket.reserves.forEach((reserve) => {
    const outCoinTypes =
      reserve.coinType === NORMALIZED_USDC_COINTYPE
        ? [reserve.coinType, NORMALIZED_USDT_COINTYPE]
        : reserve.coinType === NORMALIZED_USDT_COINTYPE
          ? [reserve.coinType, NORMALIZED_USDC_COINTYPE]
          : [reserve.coinType];

    outCoinTypes.forEach((outCoinType) => {
      const amountsAcrossObligations = (data.obligations ?? []).reduce(
        (acc, obligation) => ({
          depositedAmount: acc.depositedAmount.plus(
            obligation.deposits.find((d) => d.coinType === reserve.coinType)
              ?.depositedAmount ?? new BigNumber(0),
          ),
          borrowedAmount: acc.borrowedAmount.plus(
            obligation.borrows.find((b) => b.coinType === outCoinType)
              ?.borrowedAmount ?? new BigNumber(0),
          ),
        }),
        {
          depositedAmount: new BigNumber(0),
          borrowedAmount: new BigNumber(0),
        },
      );

      if (
        amountsAcrossObligations.depositedAmount.gt(LOOPING_THRESHOLD) &&
        amountsAcrossObligations.borrowedAmount.gt(LOOPING_THRESHOLD)
      )
        result.push([reserve.coinType, outCoinType]);
    });
  });

  if (
    result.find(
      (coinTypes) =>
        coinTypes[0] === NORMALIZED_USDT_COINTYPE &&
        coinTypes[1] === NORMALIZED_USDT_COINTYPE,
    ) &&
    result.find(
      (coinTypes) =>
        coinTypes[0] === NORMALIZED_USDC_COINTYPE &&
        coinTypes[1] === NORMALIZED_USDC_COINTYPE,
    )
  ) {
    result = result.filter(
      (coinTypes) =>
        !(
          coinTypes[0] === NORMALIZED_USDT_COINTYPE &&
          coinTypes[1] === NORMALIZED_USDC_COINTYPE
        ) &&
        !(
          coinTypes[0] === NORMALIZED_USDC_COINTYPE &&
          coinTypes[1] === NORMALIZED_USDT_COINTYPE
        ),
    );
  }

  return result;
};
