import BigNumber from "bignumber.js";

import { AppData } from "@/contexts/AppContext";
import { NORMALIZED_STABLECOIN_COINTYPES, isStablecoin } from "@/lib/coinType";

export const LOOPING_THRESHOLD = 0;

const LOOPING_DEFINITION =
  "depositing and borrowing the same non-stablecoin asset, or the same/different stablecoin assets";
export const LOOPING_MESSAGE = `You are looping (defined as ${LOOPING_DEFINITION}). Looped positions are no longer eligible for LM rewards. Please unloop and redeposit to be eligible for rewards.`;
export const LOOPING_WARNING_MESSAGE = (action: string, symbol: string) =>
  `Note that by ${action} ${symbol} you will be looping (defined as ${LOOPING_DEFINITION}) and no longer eligible for LM rewards.`;

export const getLoopedAssetCoinTypes = (data: AppData) => {
  if (data.obligations === undefined || data.obligations.length === 0)
    return [];

  let result: string[][] = [];
  data.lendingMarket.reserves.forEach((reserve) => {
    const outCoinTypes = isStablecoin(reserve.coinType)
      ? NORMALIZED_STABLECOIN_COINTYPES
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

  NORMALIZED_STABLECOIN_COINTYPES.forEach((coinType1) => {
    NORMALIZED_STABLECOIN_COINTYPES.filter(
      (coinType) => coinType !== coinType1,
    ).forEach((coinType2) => {
      if (
        result.find(
          (coinTypes) =>
            coinTypes[0] === coinType1 && coinTypes[1] === coinType1,
        ) &&
        result.find(
          (coinTypes) =>
            coinTypes[0] === coinType2 && coinTypes[1] === coinType2,
        )
      ) {
        result = result.filter(
          (coinTypes) =>
            !(coinTypes[0] === coinType1 && coinTypes[1] === coinType2) &&
            !(coinTypes[0] === coinType2 && coinTypes[1] === coinType1),
        );
      }
    });
  });

  return result;
};
