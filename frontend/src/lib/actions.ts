import BigNumber from "bignumber.js";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import { AppData } from "@/contexts/AppContext";
import {
  NORMALIZED_STABLECOIN_COINTYPES,
  isStablecoin,
  isSui,
} from "@/lib/coinType";
import { SUI_GAS_MIN, msPerYear } from "@/lib/constants";
import { LOOPING_THRESHOLD, LOOPING_WARNING_MESSAGE } from "@/lib/looping";
import { Action } from "@/lib/types";

const getMaxCalculations = (
  action: Action,
  reserve: ParsedReserve,
  balance: BigNumber,
  data: AppData,
  obligation: ParsedObligation | null,
) => {
  if (action === Action.DEPOSIT) {
    // Calculate safe deposit limit (subtract 10 mins of deposit APR from cap)
    const tenMinsDepositAprPercent = reserve.depositAprPercent
      .div(msPerYear)
      .times(10 * 60 * 1000);

    const safeDepositLimit = reserve.config.depositLimit.minus(
      reserve.depositedAmount.times(tenMinsDepositAprPercent.div(100)),
    );
    const safeDepositLimitUsd = reserve.config.depositLimitUsd.minus(
      reserve.depositedAmount
        .times(reserve.maxPrice)
        .times(tenMinsDepositAprPercent.div(100)),
    );

    const result = [
      {
        reason: `Insufficient ${reserve.symbol} balance`,
        isDisabled: true,
        value: balance,
      },
      {
        reason: "Exceeds reserve deposit limit",
        isDisabled: true,
        value: BigNumber.max(
          safeDepositLimit.minus(reserve.depositedAmount),
          0,
        ),
      },
      {
        reason: "Exceeds reserve USD deposit limit",
        isDisabled: true,
        value: BigNumber.max(
          safeDepositLimitUsd
            .minus(reserve.depositedAmount.times(reserve.maxPrice))
            .div(reserve.maxPrice),
          0,
        ),
      },
    ];
    if (isSui(reserve.coinType))
      result.push({
        reason: `${SUI_GAS_MIN} SUI should be saved for gas`,
        isDisabled: true,
        value: balance.minus(SUI_GAS_MIN),
      });

    return result;
  } else if (action === Action.BORROW) {
    const MIN_AVAILABLE_AMOUNT = 100;

    const borrowFee = reserve.config.borrowFeeBps / 10000;

    return [
      {
        reason: "Insufficient liquidity to borrow",
        isDisabled: true,
        value: reserve.availableAmount
          .minus(
            new BigNumber(MIN_AVAILABLE_AMOUNT).div(10 ** reserve.mintDecimals),
          )
          .div(1 + borrowFee),
      },
      {
        reason: "Over reserve borrow limit",
        isDisabled: true,
        value: reserve.config.borrowLimit
          .minus(reserve.borrowedAmount)
          .div(1 + borrowFee),
      },
      {
        reason: "Borrows cannot exceed borrow limit",
        isDisabled: true,
        value:
          !obligation ||
          obligation.maxPriceWeightedBorrowsUsd.gt(
            obligation.minPriceBorrowLimitUsd,
          )
            ? new BigNumber(0)
            : obligation.minPriceBorrowLimitUsd
                .minus(obligation.maxPriceWeightedBorrowsUsd)
                .div(
                  reserve.maxPrice.times(
                    reserve.config.borrowWeightBps / 10000,
                  ),
                )
                .div(1 + borrowFee),
      },
      {
        reason: "Pool outflow rate limit surpassed",
        isDisabled: true,
        value: data.lendingMarket.rateLimiter.remainingOutflow
          .div(reserve.maxPrice)
          .div(reserve.config.borrowWeightBps / 10000)
          .div(1 + borrowFee),
      },
    ];
  } else if (action === Action.WITHDRAW) {
    const MIN_AVAILABLE_AMOUNT = 100;

    const depositPosition = obligation?.deposits.find(
      (deposit) => deposit.coinType === reserve.coinType,
    );
    const depositedAmount =
      depositPosition?.depositedAmount ?? new BigNumber(0);

    return [
      {
        reason: "Withdraws cannot exceed deposits",
        isDisabled: true,
        value: depositedAmount,
      },
      {
        reason: "Insufficient liquidity to borrow",
        isDisabled: true,
        value: reserve.availableAmount.minus(
          new BigNumber(MIN_AVAILABLE_AMOUNT).div(10 ** reserve.mintDecimals),
        ),
      },
      {
        reason: "Withdraw is unhealthy",
        isDisabled: true,
        value:
          !obligation ||
          obligation.maxPriceWeightedBorrowsUsd.gt(
            obligation.minPriceBorrowLimitUsd,
          )
            ? new BigNumber(0)
            : obligation.minPriceBorrowLimitUsd
                .minus(obligation.maxPriceWeightedBorrowsUsd)
                .div(reserve.minPrice)
                .div(reserve.config.openLtvPct / 100),
      },
      {
        reason: "Pool outflow rate limit surpassed",
        isDisabled: true,
        value: data.lendingMarket.rateLimiter.remainingOutflow.div(
          reserve.maxPrice,
        ),
      },
    ];
  } else if (action === Action.REPAY) {
    const borrowPosition = obligation?.borrows.find(
      (borrow) => borrow.coinType === reserve.coinType,
    );
    const borrowedAmount = borrowPosition?.borrowedAmount ?? new BigNumber(0);

    const result = [
      {
        reason: `Insufficient ${reserve.symbol} balance`,
        isDisabled: true,
        value: balance,
      },
      {
        reason: "Repay amount exceeds borrowed amount",
        isDisabled: true,
        value: borrowedAmount,
      },
    ];
    if (isSui(reserve.coinType))
      result.push({
        reason: `${SUI_GAS_MIN} SUI should be saved for gas`,
        isDisabled: true,
        value: balance.minus(SUI_GAS_MIN),
      });

    return result;
  }

  return [];
};

export const getMaxValue =
  (
    action: Action,
    reserve: ParsedReserve,
    balance: BigNumber,
    data: AppData,
    obligation: ParsedObligation | null,
  ) =>
  () => {
    const maxCalculations = getMaxCalculations(
      action,
      reserve,
      balance,
      data,
      obligation,
    );

    return BigNumber.max(
      new BigNumber(0),
      BigNumber.min(
        ...Object.values(maxCalculations).map((calc) => calc.value),
      ),
    );
  };

const getDepositedAmountAcrossObligations = (
  coinType: string,
  obligations?: ParsedObligation[],
) =>
  (obligations ?? []).reduce(
    (acc, obligation) =>
      acc.plus(
        obligation.deposits.find((d) => d.coinType === coinType)
          ?.depositedAmount ?? new BigNumber(0),
      ),
    new BigNumber(0),
  );
const getBorrowedAmountAcrossObligations = (
  coinType: string,
  obligations?: ParsedObligation[],
) =>
  (obligations ?? []).reduce(
    (acc, obligation) =>
      acc.plus(
        obligation.borrows.find((b) => b.coinType === coinType)
          ?.borrowedAmount ?? new BigNumber(0),
      ),
    new BigNumber(0),
  );

export const getSubmitButtonNoValueState =
  (action: Action, reserve: ParsedReserve, obligations?: ParsedObligation[]) =>
  () => {
    if (action === Action.DEPOSIT) {
      if (reserve.depositedAmount.gte(reserve.config.depositLimit))
        return {
          isDisabled: true,
          title: "Reserve deposit limit reached",
        };
      if (
        new BigNumber(reserve.depositedAmountUsd).gte(
          reserve.config.depositLimitUsd,
        )
      )
        return {
          isDisabled: true,
          title: "Reserve USD deposit limit reached",
        };
      if (
        getBorrowedAmountAcrossObligations(reserve.coinType, obligations).gt(
          LOOPING_THRESHOLD,
        )
      )
        return { isDisabled: true, title: "Cannot deposit borrowed asset" };
      return undefined;
    } else if (action === Action.BORROW) {
      if (reserve.borrowedAmount.gte(reserve.config.borrowLimit))
        return {
          isDisabled: true,
          title: "Reserve borrow limit reached",
        };
      if (
        new BigNumber(reserve.borrowedAmount.times(reserve.price)).gte(
          reserve.config.borrowLimitUsd,
        )
      )
        return {
          isDisabled: true,
          title: "Reserve USD borrow limit reached",
        };
      if (
        getDepositedAmountAcrossObligations(reserve.coinType, obligations).gt(
          LOOPING_THRESHOLD,
        )
      )
        return { isDisabled: true, title: "Cannot borrow deposited asset" };
      return undefined;
    }
  };

export const getSubmitButtonState =
  (
    action: Action,
    reserve: ParsedReserve,
    balance: BigNumber,
    data: AppData,
    obligation: ParsedObligation | null,
  ) =>
  (value: string) => {
    const maxCalculations = getMaxCalculations(
      action,
      reserve,
      balance,
      data,
      obligation,
    );

    for (const calc of maxCalculations) {
      if (new BigNumber(value).gt(calc.value))
        return { isDisabled: calc.isDisabled, title: calc.reason };
    }
    return undefined;
  };

export const getLoopingWarningMessage =
  (action: Action, reserve: ParsedReserve, obligations?: ParsedObligation[]) =>
  () => {
    if (!isStablecoin(reserve.coinType)) return undefined;

    for (const stablecoinCoinType of NORMALIZED_STABLECOIN_COINTYPES) {
      if (stablecoinCoinType === reserve.coinType) continue;

      if (action === Action.DEPOSIT) {
        if (
          getBorrowedAmountAcrossObligations(
            stablecoinCoinType,
            obligations,
          ).gt(LOOPING_THRESHOLD)
        )
          return LOOPING_WARNING_MESSAGE("depositing", reserve.symbol);
      } else if (action === Action.BORROW) {
        if (
          getDepositedAmountAcrossObligations(
            stablecoinCoinType,
            obligations,
          ).gt(LOOPING_THRESHOLD)
        )
          return LOOPING_WARNING_MESSAGE("borrowing", reserve.symbol);
      }
    }

    return undefined;
  };
