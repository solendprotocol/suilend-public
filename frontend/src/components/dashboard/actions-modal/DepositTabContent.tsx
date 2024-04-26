import BigNumber from "bignumber.js";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import ActionsModalTabContent from "@/components/dashboard/actions-modal/ActionsModalTabContent";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { isSui } from "@/lib/coinType";
import { SUI_DEPOSIT_GAS_MIN, msPerYear } from "@/lib/constants";
import { Action } from "@/lib/types";

interface DepositTabContentProps {
  reserve: ParsedReserve;
}

export default function DepositTabContent({ reserve }: DepositTabContentProps) {
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  const coinBalanceForReserve =
    data.coinBalancesMap[reserve.coinType]?.balance ?? new BigNumber("0");

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

  const maxCalculations = [
    {
      reason: "Insufficient balance",
      isDisabled: true,
      value: coinBalanceForReserve,
    },
    {
      reason: "Exceeds reserve deposit limit",
      isDisabled: true,
      value: BigNumber.max(safeDepositLimit.minus(reserve.depositedAmount), 0),
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
    maxCalculations.push({
      reason: `Min ${SUI_DEPOSIT_GAS_MIN} SUI should be saved for gas`,
      isDisabled: true,
      value: coinBalanceForReserve.minus(SUI_DEPOSIT_GAS_MIN),
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
        newBorrowLimitUsd: null,
        newBorrowUtilization: null,
      };
    const valueObj = new BigNumber(value);
    if (!obligation || valueObj.isNaN())
      return {
        newBorrowLimitUsd: null,
        newBorrowUtilization: null,
      };

    const newBorrowLimitUsd = obligation.minPriceBorrowLimitUsd.plus(
      valueObj.times(reserve.minPrice).times(reserve.config.openLtvPct / 100),
    );
    const newBorrowUtilization =
      newBorrowLimitUsd && !newBorrowLimitUsd.isZero()
        ? obligation.weightedBorrowsUsd.div(newBorrowLimitUsd)
        : null;

    return {
      newBorrowLimitUsd,
      newBorrowUtilization: newBorrowUtilization
        ? BigNumber.max(BigNumber.min(1, newBorrowUtilization), 0)
        : null,
    };
  };

  // Submit
  const borrowPosition = obligation?.borrows?.find(
    (d) => d.coinType === reserve.coinType,
  );
  const borrowedAmount = borrowPosition?.borrowedAmount ?? new BigNumber("0");

  const getSubmitButtonNoValueState = () => {
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
    if (borrowedAmount.gt(0.01))
      return { isDisabled: true, title: "Cannot deposit borrowed asset" };
    return undefined;
  };

  const getSubmitButtonState = (value: string) => {
    for (const calc of maxCalculations) {
      if (new BigNumber(value).gt(calc.value))
        return { isDisabled: calc.isDisabled, title: calc.reason };
    }
    return undefined;
  };

  const { deposit } = useDashboardContext();

  return (
    <ActionsModalTabContent
      action={Action.DEPOSIT}
      actionPastTense="deposited"
      reserve={reserve}
      getNewCalculations={getNewCalculations}
      getMaxValue={getMaxValue}
      getSubmitButtonNoValueState={getSubmitButtonNoValueState}
      getSubmitButtonState={getSubmitButtonState}
      submit={deposit}
    />
  );
}
