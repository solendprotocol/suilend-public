import BigNumber from "bignumber.js";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import ActionsModalTabContent from "@/components/dashboard/actions-modal/ActionsModalTabContent";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { isSui } from "@/lib/coinType";
import { SUI_REPAY_GAS_MIN } from "@/lib/constants";
import { Action } from "@/lib/types";

interface RepayTabContentProps {
  reserve: ParsedReserve;
}

export default function RepayTabContent({ reserve }: RepayTabContentProps) {
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  const coinBalanceForReserve =
    data.coinBalancesMap[reserve.coinType]?.balance ?? new BigNumber("0");
  const position = obligation?.borrows.find(
    (borrow) => borrow.coinType === reserve.coinType,
  );
  const borrowedAmount = position?.borrowedAmount ?? new BigNumber("0");

  const maxCalculations = [
    {
      reason: "Insufficient balance",
      isDisabled: true,
      value: coinBalanceForReserve,
    },
    {
      reason: "Repay amount exceeds borrowed amount",
      isDisabled: true,
      value: borrowedAmount,
    },
  ];
  if (isSui(reserve.coinType))
    maxCalculations.push({
      reason: `Min ${SUI_REPAY_GAS_MIN} SUI should be saved for gas`,
      isDisabled: true,
      value: coinBalanceForReserve.minus(SUI_REPAY_GAS_MIN),
    });

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
      !valueObj.isNaN() && !obligation.minPriceBorrowLimit.isZero()
        ? obligation.totalBorrowUsd
            .minus(
              valueObj
                .times(reserve.maxPrice)
                .times(reserve.config.borrowFeeBps / 10000),
            )
            .div(obligation.minPriceBorrowLimit)
        : null;

    return {
      newBorrowLimit: null,
      newBorrowUtilization: newBorrowUtilization
        ? BigNumber.max(BigNumber.min(1, newBorrowUtilization), 0)
        : null,
    };
  };

  // Submit
  const getSubmitButtonState = (value: string) => {
    for (const calc of maxCalculations) {
      if (new BigNumber(value).gt(calc.value))
        return { isDisabled: calc.isDisabled, title: calc.reason };
    }
    return undefined;
  };

  const { repay } = useDashboardContext();

  return (
    <ActionsModalTabContent
      action={Action.REPAY}
      actionPastTense="repaid"
      reserve={reserve}
      getNewCalculations={getNewCalculations}
      getMaxValue={getMaxValue}
      getSubmitButtonState={getSubmitButtonState}
      submit={repay}
    />
  );
}
