import BigNumber from "bignumber.js";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import ActionsModalTabContent from "@/components/dashboard/actions-modal/ActionsModalTabContent";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { Action } from "@/lib/types";

interface WithdrawTabContentProps {
  reserve: ParsedReserve;
}

const MIN_AVAILABLE_AMOUNT = 100;

export default function WithdrawTabContent({
  reserve,
}: WithdrawTabContentProps) {
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  const position = obligation?.deposits.find(
    (deposit) => deposit.coinType === reserve.coinType,
  );
  const depositedAmount = position?.depositedAmount ?? new BigNumber("0");

  const maxCalculations = [
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
        obligation.maxPriceTotalWeightedBorrowUsd.gt(
          obligation.minPriceBorrowLimit,
        )
          ? new BigNumber(0)
          : obligation.minPriceBorrowLimit
              .minus(obligation.maxPriceTotalWeightedBorrowUsd)
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

  // Value
  const getMaxValue = () => {
    return BigNumber.max(
      new BigNumber(0),
      BigNumber.min(
        ...Object.values(maxCalculations).map((calc) => calc.value),
      ),
    ).toFixed(reserve.mintDecimals, BigNumber.ROUND_DOWN);
  };

  // Submit
  const getSubmitButtonState = (value: string) => {
    for (const calc of maxCalculations) {
      if (new BigNumber(value).gt(calc.value))
        return { isDisabled: calc.isDisabled, title: calc.reason };
    }
    return undefined;
  };

  const { withdraw } = useDashboardContext();

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

    const newBorrowLimit = !valueObj.isNaN()
      ? obligation.minPriceBorrowLimit.minus(
          valueObj
            .times(reserve.minPrice)
            .times(reserve.config.openLtvPct / 100),
        )
      : null;

    const newBorrowUtilization =
      newBorrowLimit && !newBorrowLimit.isZero()
        ? obligation.totalBorrowUsd.div(newBorrowLimit)
        : null;

    return {
      newBorrowLimit,
      newBorrowUtilization: newBorrowUtilization
        ? BigNumber.max(BigNumber.min(1, newBorrowUtilization), 0)
        : null,
    };
  };

  return (
    <ActionsModalTabContent
      action={Action.WITHDRAW}
      actionPastTense="withdrew"
      reserve={reserve}
      getNewCalculations={getNewCalculations}
      getMaxValue={getMaxValue}
      getSubmitButtonState={getSubmitButtonState}
      submit={withdraw}
    />
  );
}
