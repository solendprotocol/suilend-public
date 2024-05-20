import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";

import { WAD } from "../constants";
import {
  ApiReserveAssetDataEvent,
  DownsampledApiReserveAssetDataEvent,
} from "../types";

import { ParsedReserve } from "./reserve";

export type ParsedReserveAssetDataEvent = ReturnType<
  typeof parseReserveAssetDataEvent
>;

const calculateBorrowAprPercent = (
  utilizationPercent: BigNumber,
  reserve: ParsedReserve,
) => {
  const config = reserve.config;

  let i = 1;
  while (i < config.interestRate.length) {
    const leftUtilPercent = config.interestRate[i - 1].utilPercent;
    const leftAprPercent = config.interestRate[i - 1].aprPercent;

    const rightUtilPercent = config.interestRate[i].utilPercent;
    const rightAprPercent = config.interestRate[i].aprPercent;

    if (
      utilizationPercent.gte(leftUtilPercent) &&
      utilizationPercent.lte(rightUtilPercent)
    ) {
      const weight = new BigNumber(
        utilizationPercent.minus(leftUtilPercent),
      ).div(rightUtilPercent.minus(leftUtilPercent));

      return leftAprPercent.plus(
        weight.times(rightAprPercent.minus(leftAprPercent)),
      );
    }
    i = i + 1;
  }
  // Should never reach here
  return new BigNumber(0);
};

export const parseReserveAssetDataEvent = (
  event: ApiReserveAssetDataEvent,
  reserve: ParsedReserve,
) => {
  const depositedAmount = new BigNumber(event.supplyAmount)
    .div(WAD)
    .div(10 ** reserve.mintDecimals);
  const borrowedAmount = new BigNumber(event.borrowedAmount)
    .div(WAD)
    .div(10 ** reserve.mintDecimals);
  const availableAmount = new BigNumber(event.availableAmount)
    .div(WAD)
    .div(10 ** reserve.mintDecimals);

  const ctokenSupply = new BigNumber(event.ctokenSupply).div(
    10 ** reserve.mintDecimals,
  );

  const utilizationPercent = depositedAmount.eq(0)
    ? new BigNumber(0)
    : borrowedAmount.div(depositedAmount).times(100);

  const borrowAprPercent = calculateBorrowAprPercent(
    utilizationPercent,
    reserve,
  );
  const depositAprPercent = utilizationPercent
    .div(100)
    .times(borrowAprPercent.div(100))
    .times(
      new BigNumber(100).minus(
        new BigNumber(reserve.config.spreadFeeBps).div(100),
      ),
    );

  const price = new BigNumber(event.price).div(WAD);
  const smoothedPrice = new BigNumber(event.smoothedPrice).div(WAD);
  const minPrice = BigNumber.min(price, smoothedPrice);
  const maxPrice = BigNumber.max(price, smoothedPrice);

  const depositedAmountUsd = depositedAmount.times(price);
  const borrowedAmountUsd = borrowedAmount.times(price);
  const availableAmountUsd = availableAmount.times(price);

  return {
    id: event.id,
    lendingMarket: event.lendingMarketId,
    coinType: normalizeStructTag(event.coinType),
    reserveId: event.reserveId,
    depositedAmount,
    borrowedAmount,
    availableAmount,
    depositedAmountUsd,
    borrowedAmountUsd,
    availableAmountUsd,
    utilizationPercent: utilizationPercent,
    borrowAprPercent: borrowAprPercent,
    depositAprPercent: depositAprPercent,
    ctokenSupply: ctokenSupply,
    cumulativeBorrowRate: event.cumulativeBorrowRate,
    price: price,
    smoothedPrice: smoothedPrice,
    minPrice,
    maxPrice,
    priceLastUpdateTimestampS: event.priceLastUpdateTimestampS,
    timestampS: event.timestamp,
    digest: event.digest,
    eventIndex: event.eventIndex,
    sender: event.sender,
  };
};

export type ParsedDownsampledApiReserveAssetDataEvent = ReturnType<
  typeof parseDownsampledApiReserveAssetDataEvent
>;

export const parseDownsampledApiReserveAssetDataEvent = (
  event: DownsampledApiReserveAssetDataEvent,
  reserve: ParsedReserve,
) => {
  return {
    ...parseReserveAssetDataEvent(event, reserve),
    sampleTimestampS: event.sampletimestamp,
  };
};
