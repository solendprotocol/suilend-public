import BigNumber from "bignumber.js";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import ActionsModalTabContent from "@/components/dashboard/actions-modal/ActionsModalTabContent";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { Action } from "@/lib/types";

interface BorrowTabContentProps {
  reserve: ParsedReserve;
}

const MIN_AVAILABLE_AMOUNT = 100;

export default function BorrowTabContent({ reserve }: BorrowTabContentProps) {
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  const borrowFee = reserve.config.borrowFeeBps / 10000;

  const maxCalculations = [
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
        obligation.maxPriceTotalWeightedBorrowUsd.gt(
          obligation.minPriceBorrowLimitUsd,
        )
          ? new BigNumber(0)
          : obligation.minPriceBorrowLimitUsd
              .minus(obligation.maxPriceTotalWeightedBorrowUsd)
              .div(
                reserve.maxPrice.times(reserve.config.borrowWeightBps / 10000),
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

  // Value
  const getMaxValue = () => {
    return BigNumber.max(
      new BigNumber(0),
      BigNumber.min(
        ...Object.values(maxCalculations).map((calc) => calc.value),
      ),
    ).toFixed(reserve.mintDecimals, BigNumber.ROUND_DOWN);
  };

  const getNewCalculations = (value: string) => {
    if (!value.length)
      return {
        newBorrowLimit: null,
        newBorrowUtilization: null,
      };
    const valueObj = new BigNumber(value);
    if (!obligation || valueObj.isNaN())
      return {
        newBorrowLimit: null,
        newBorrowUtilization: null,
      };

    const newBorrowUtilization =
      !valueObj.isNaN() && !obligation.minPriceBorrowLimitUsd.isZero()
        ? obligation.maxPriceTotalWeightedBorrowUsd
            .plus(
              valueObj
                .times(reserve.maxPrice)
                .times(reserve.config.borrowWeightBps / 10000),
            )
            .div(obligation.minPriceBorrowLimitUsd)
        : null;

    return {
      newBorrowLimit: null,
      newBorrowUtilization: newBorrowUtilization
        ? BigNumber.max(BigNumber.min(1, newBorrowUtilization), 0)
        : null,
    };
  };

  // Submit
  const depositPosition = obligation?.deposits?.find(
    (d) => d.coinType === reserve.coinType,
  );
  const depositedAmount =
    depositPosition?.depositedAmount ?? new BigNumber("0");

  const getSubmitButtonNoValueState = () => {
    if (depositedAmount.gt(0.1))
      return { isDisabled: true, title: "Cannot borrow supplied asset" };
    return undefined;
  };

  const getSubmitButtonState = (value: string) => {
    for (const calc of maxCalculations) {
      if (new BigNumber(value).gt(calc.value))
        return { isDisabled: calc.isDisabled, title: calc.reason };
    }
    return undefined;
  };

  const { borrow } = useDashboardContext();

  return (
    <ActionsModalTabContent
      action={Action.BORROW}
      actionPastTense="borrowed"
      reserve={reserve}
      getNewCalculations={getNewCalculations}
      getMaxValue={getMaxValue}
      getSubmitButtonNoValueState={getSubmitButtonNoValueState}
      getSubmitButtonState={getSubmitButtonState}
      submit={borrow}
    />
  );
}
