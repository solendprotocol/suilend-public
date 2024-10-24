import BigNumber from "bignumber.js";

import { ParsedObligation } from "@suilend/sdk/parsers";

import { AppData } from "@/contexts/AppContext";
import { NORMALIZED_STABLECOIN_COINTYPES, isStablecoin } from "@/lib/coinType";

export const LOOPING_THRESHOLD = 0;

const LOOPING_DEFINITION =
  "depositing and borrowing the same non-stablecoin asset, or the same/different stablecoin assets";
const REWARDS_DEFINITION = "rewards (including Suilend Points)";

export const IS_LOOPING_MESSAGE = `You are looping (defined as ${LOOPING_DEFINITION}). Wallets with looped positions are not eligible for ${REWARDS_DEFINITION}.`;
export const WAS_LOOPING_MESSAGE = (
  <>
    You were looping in the past (defined as {LOOPING_DEFINITION}).
    <br />
    <br />
    Restore eligibility for {REWARDS_DEFINITION} by interacting with each asset
    (deposit or withdraw any amount for deposits, borrow or repay any amount for
    borrows).
    <br />
    <br />
    You can automate this process by clicking the button below.
  </>
);

export const LOOPING_WARNING_MESSAGE = (action: string, symbol: string) =>
  `Note that by ${action} ${symbol} you will be looping (defined as ${LOOPING_DEFINITION}) and no longer eligible for ${REWARDS_DEFINITION}.`;

export const getLoopedAssetCoinTypes = (
  data: AppData,
  obligation: ParsedObligation | null,
) => {
  let result: string[][] = [];
  data.lendingMarket.reserves.forEach((reserve) => {
    const outCoinTypes = isStablecoin(reserve.coinType)
      ? NORMALIZED_STABLECOIN_COINTYPES
      : [reserve.coinType];

    outCoinTypes.forEach((outCoinType) => {
      const depositedAmount =
        obligation?.deposits.find((d) => d.coinType === reserve.coinType)
          ?.depositedAmount ?? new BigNumber(0);
      const borrowedAmount =
        obligation?.borrows.find((b) => b.coinType === outCoinType)
          ?.borrowedAmount ?? new BigNumber(0);

      if (
        depositedAmount.gt(LOOPING_THRESHOLD) &&
        borrowedAmount.gt(LOOPING_THRESHOLD)
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
export const getIsLooping = (
  data: AppData,
  obligation: ParsedObligation | null,
) => {
  const loopedAssetCoinTypes = getLoopedAssetCoinTypes(data, obligation);
  return loopedAssetCoinTypes.length > 0;
};

export const getZeroSharePositions = (obligation: ParsedObligation | null) => ({
  deposits: (obligation?.deposits || []).filter(
    (d) =>
      d.depositedAmount.gt(0) &&
      new BigNumber(d.userRewardManager.share.toString()).eq(0),
  ),
  borrows: (obligation?.borrows || []).filter(
    (b) =>
      b.borrowedAmount.gt(0) &&
      new BigNumber(b.userRewardManager.share.toString()).eq(0),
  ),
});
export const getWasLooping = (
  data: AppData,
  obligation: ParsedObligation | null,
) => {
  const isLooping = getIsLooping(data, obligation);
  const { deposits: zeroShareDeposits, borrows: zeroShareBorrows } =
    getZeroSharePositions(obligation);

  return (
    !isLooping && (zeroShareDeposits.length > 0 || zeroShareBorrows.length > 0)
  );
};
