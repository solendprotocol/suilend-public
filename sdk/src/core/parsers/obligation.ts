import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";

import { WAD } from "../constants";

import { Deps } from "./deps";
import { ParsedReserve } from "./reserve";

export type ParsedObligation = ReturnType<typeof parseObligation>;
export type ParsedPosition =
  | ParsedObligation["deposits"][0]
  | ParsedObligation["borrows"][0];

export const parseObligation = (
  { Obligation }: Pick<Deps, "Obligation">,
  obligation: typeof Obligation,
  parsedReserveMap: { [coinType: string]: ParsedReserve },
) => {
  let totalSupplyUsd = new BigNumber(0);
  let totalBorrowUsd = new BigNumber(0);
  let borrowLimit = new BigNumber(0);
  let minPriceBorrowLimit = new BigNumber(0);
  let unhealthyBorrowValueUsd = new BigNumber(0);
  let totalWeightedBorrowUsd = new BigNumber(0);
  let maxPriceTotalWeightedBorrowUsd = new BigNumber(0);

  const positionCount =
    (obligation.deposits as any[]).filter(
      (pos) => pos.depositedCtokenAmount.toString() !== "0",
    ).length +
    (obligation.borrows as any[]).filter(
      (pos) => pos.borrowedAmount.value.toString() !== "0",
    ).length;

  const deposits = (obligation.deposits as any[]).map((deposit) => {
    const coinType = normalizeStructTag(deposit.coinType.name);
    const reserve = parsedReserveMap[coinType];
    if (!reserve)
      throw new Error(
        `Reserve with coinType ${deposit.coinType.name} not found`,
      );
    const depositedCtokenAmount = new BigNumber(
      deposit.depositedCtokenAmount.toString(),
    ).div(10 ** reserve.mintDecimals);
    const depositedAmount = depositedCtokenAmount.times(
      reserve.cTokenExchangeRate,
    );
    const depositedAmountUsd = depositedAmount.times(reserve.price);
    totalSupplyUsd = totalSupplyUsd.plus(depositedAmountUsd);

    minPriceBorrowLimit = minPriceBorrowLimit.plus(
      depositedAmount
        .times(reserve.minPrice)
        .times(reserve.config.openLtvPct / 100),
    );
    borrowLimit = borrowLimit.plus(
      depositedAmountUsd.times(reserve.config.openLtvPct / 100),
    );
    unhealthyBorrowValueUsd = unhealthyBorrowValueUsd.plus(
      depositedAmountUsd.times(reserve.config.closeLtvPct / 100),
    );

    const userRewardManagerIndex = Number(
      deposit.userRewardManagerIndex.toString(),
    );
    const userRewardManager =
      obligation.userRewardManagers[userRewardManagerIndex];

    const reserveArrayIndex = deposit.reserveArrayIndex;

    return {
      coinType,
      reserveArrayIndex,
      userRewardManagerIndex,
      depositedAmount,
      depositedAmountUsd,
      userRewardManager,
      reserve,
      original: obligation,
    };
  });

  const borrows = (obligation.borrows as any[]).map((borrow) => {
    const coinType = normalizeStructTag(borrow.coinType.name);
    const reserve = parsedReserveMap[coinType];
    if (!reserve)
      throw new Error(
        `Reserve with coinType ${borrow.coinType.name} not found`,
      );
    const reserveCumulativeBorrowRate = new BigNumber(
      borrow.cumulativeBorrowRate.value.toString(),
    ).div(WAD.toString());
    const borrowedAmountInitial = new BigNumber(
      borrow.borrowedAmount.value.toString(),
    )
      .div(WAD.toString())
      .div(10 ** reserve.mintDecimals);
    const borrowInterestIndex = reserve.cumulativeBorrowRate.div(
      reserveCumulativeBorrowRate,
    );
    const borrowedAmount = borrowedAmountInitial.times(borrowInterestIndex);
    const borrowedAmountUsd = borrowedAmount.times(reserve.price);
    const borrowWeight = reserve.config.borrowWeightBps / 10000;

    totalBorrowUsd = totalBorrowUsd.plus(borrowedAmountUsd);
    totalWeightedBorrowUsd = totalWeightedBorrowUsd.plus(
      borrowedAmountUsd.times(borrowWeight),
    );

    maxPriceTotalWeightedBorrowUsd = maxPriceTotalWeightedBorrowUsd.plus(
      borrowedAmount.times(reserve.maxPrice).times(borrowWeight),
    );

    const userRewardManagerIndex = Number(
      borrow.userRewardManagerIndex.toString(),
    );
    const userRewardManager =
      obligation.userRewardManagers[userRewardManagerIndex];
    const reserveArrayIndex = borrow.reserveArrayIndex;

    return {
      coinType,
      reserveArrayIndex,
      userRewardManagerIndex,
      borrowedAmount,
      borrowedAmountUsd,
      userRewardManager,
      reserve,
      original: obligation,
    };
  });

  const netValueUsd = totalSupplyUsd.minus(totalBorrowUsd);

  const weightedConservativeBorrowUtilizationPercent =
    minPriceBorrowLimit.isZero()
      ? new BigNumber(0)
      : maxPriceTotalWeightedBorrowUsd.div(minPriceBorrowLimit).times(100);

  return {
    id: obligation.id,
    totalSupplyUsd,
    totalBorrowUsd,
    totalWeightedBorrowUsd,
    netValueUsd,
    borrowLimit,
    unhealthyBorrowValueUsd,
    positionCount,
    deposits,
    borrows,
    minPriceBorrowLimit,
    maxPriceTotalWeightedBorrowUsd,
    weightedConservativeBorrowUtilizationPercent,
    original: obligation,
  };
};
