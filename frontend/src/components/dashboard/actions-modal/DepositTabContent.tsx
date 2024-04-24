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
        newBorrowLimit: null,
        newBorrowUtilization: null,
      };
    const valueObj = new BigNumber(value);
    if (!obligation || valueObj.isNaN())
      return {
        newBorrowLimit: null,
        newBorrowUtilization: null,
      };

    const newBorrowLimit = obligation.minPriceBorrowLimitUsd.plus(
      valueObj.times(reserve.minPrice).times(reserve.config.openLtvPct / 100),
    );
    const newBorrowUtilization =
      newBorrowLimit && !newBorrowLimit.isZero()
        ? obligation.totalWeightedBorrowUsd.div(newBorrowLimit)
        : null;

    return {
      newBorrowLimit,
      newBorrowUtilization: newBorrowUtilization
        ? BigNumber.max(BigNumber.min(1, newBorrowUtilization), 0)
        : null,
    };
  };

  // Submit
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
