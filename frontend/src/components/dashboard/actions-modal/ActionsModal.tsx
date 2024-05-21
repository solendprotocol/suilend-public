import { useMemo } from "react";

import BigNumber from "bignumber.js";

import ActionsModalContainer from "@/components/dashboard/actions-modal/ActionsModalContainer";
import {
  Tab,
  useActionsModalContext,
} from "@/components/dashboard/actions-modal/ActionsModalContext";
import ActionsModalTabContent from "@/components/dashboard/actions-modal/ActionsModalTabContent";
import ParametersPanel from "@/components/dashboard/actions-modal/ParametersPanel";
import Tabs from "@/components/shared/Tabs";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import { isSui } from "@/lib/coinType";
import {
  SUI_DEPOSIT_GAS_MIN,
  SUI_REPAY_GAS_MIN,
  msPerYear,
} from "@/lib/constants";
import { Action } from "@/lib/types";

export default function ActionsModal() {
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;
  const { deposit, borrow, withdraw, repay } = useDashboardContext();
  const { reserveIndex, selectedTab, setSelectedTab, isMoreParametersOpen } =
    useActionsModalContext();

  const { md } = useBreakpoint();

  // Reserve
  const reserve =
    reserveIndex !== undefined
      ? data.lendingMarket.reserves[reserveIndex]
      : undefined;

  // Tabs
  const tabs = [
    { id: Tab.DEPOSIT, title: "Deposit" },
    { id: Tab.BORROW, title: "Borrow" },
    { id: Tab.WITHDRAW, title: "Withdraw" },
    { id: Tab.REPAY, title: "Repay" },
  ];

  // Tab config
  const tabConfig = useMemo(() => {
    if (reserve === undefined) return undefined;

    if (selectedTab === Tab.DEPOSIT) {
      const maxCalculations = (() => {
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

        const result = [
          {
            reason: "Insufficient balance",
            isDisabled: true,
            value: coinBalanceForReserve,
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
            reason: `Min ${SUI_DEPOSIT_GAS_MIN} SUI should be saved for gas`,
            isDisabled: true,
            value: coinBalanceForReserve.minus(SUI_DEPOSIT_GAS_MIN),
          });

        return result;
      })();

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
          valueObj
            .times(reserve.minPrice)
            .times(reserve.config.openLtvPct / 100),
        );
        const newBorrowUtilization =
          newBorrowLimitUsd && !newBorrowLimitUsd.eq(0)
            ? obligation.maxPriceWeightedBorrowsUsd.div(newBorrowLimitUsd)
            : null;

        return {
          newBorrowLimitUsd,
          newBorrowUtilization: newBorrowUtilization
            ? BigNumber.max(BigNumber.min(1, newBorrowUtilization), 0)
            : null,
        };
      };

      const getSubmitButtonNoValueState = () => {
        const borrowPosition = obligation?.borrows?.find(
          (d) => d.coinType === reserve.coinType,
        );
        const borrowedAmount =
          borrowPosition?.borrowedAmount ?? new BigNumber("0");

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

      return {
        action: Action.DEPOSIT,
        actionPastTense: "deposited",
        getMaxValue,
        getNewCalculations,
        getSubmitButtonNoValueState,
        getSubmitButtonState,
        submit: deposit,
      };
    } else if (selectedTab === Tab.BORROW) {
      const MIN_AVAILABLE_AMOUNT = 100;

      const maxCalculations = (() => {
        const borrowFee = reserve.config.borrowFeeBps / 10000;

        return [
          {
            reason: "Insufficient liquidity to borrow",
            isDisabled: true,
            value: reserve.availableAmount
              .minus(
                new BigNumber(MIN_AVAILABLE_AMOUNT).div(
                  10 ** reserve.mintDecimals,
                ),
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
      })();

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

        const newBorrowUtilization =
          !valueObj.isNaN() && !obligation.minPriceBorrowLimitUsd.eq(0)
            ? obligation.maxPriceWeightedBorrowsUsd
                .plus(
                  valueObj
                    .times(reserve.maxPrice)
                    .times(reserve.config.borrowWeightBps / 10000),
                )
                .div(obligation.minPriceBorrowLimitUsd)
            : null;

        return {
          newBorrowLimitUsd: null,
          newBorrowUtilization: newBorrowUtilization
            ? BigNumber.max(BigNumber.min(1, newBorrowUtilization), 0)
            : null,
        };
      };

      const getSubmitButtonNoValueState = () => {
        const depositPosition = obligation?.deposits?.find(
          (d) => d.coinType === reserve.coinType,
        );
        const depositedAmount =
          depositPosition?.depositedAmount ?? new BigNumber("0");

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
        if (depositedAmount.gt(0.01))
          return { isDisabled: true, title: "Cannot borrow deposited asset" };
        return undefined;
      };

      const getSubmitButtonState = (value: string) => {
        for (const calc of maxCalculations) {
          if (new BigNumber(value).gt(calc.value))
            return { isDisabled: calc.isDisabled, title: calc.reason };
        }
        return undefined;
      };

      return {
        action: Action.BORROW,
        actionPastTense: "borrowed",
        getMaxValue,
        getNewCalculations,
        getSubmitButtonNoValueState,
        getSubmitButtonState,
        submit: borrow,
      };
    } else if (selectedTab === Tab.WITHDRAW) {
      const MIN_AVAILABLE_AMOUNT = 100;

      const maxCalculations = (() => {
        const position = obligation?.deposits.find(
          (deposit) => deposit.coinType === reserve.coinType,
        );
        const depositedAmount = position?.depositedAmount ?? new BigNumber("0");

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
              new BigNumber(MIN_AVAILABLE_AMOUNT).div(
                10 ** reserve.mintDecimals,
              ),
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
      })();

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

        const newBorrowLimitUsd = !valueObj.isNaN()
          ? obligation.minPriceBorrowLimitUsd.minus(
              valueObj
                .times(reserve.minPrice)
                .times(reserve.config.openLtvPct / 100),
            )
          : null;

        const newBorrowUtilization =
          newBorrowLimitUsd && !newBorrowLimitUsd.eq(0)
            ? obligation.borrowedAmountUsd.div(newBorrowLimitUsd)
            : null;

        return {
          newBorrowLimitUsd,
          newBorrowUtilization: newBorrowUtilization
            ? BigNumber.max(BigNumber.min(1, newBorrowUtilization), 0)
            : null,
        };
      };

      const getSubmitButtonState = (value: string) => {
        for (const calc of maxCalculations) {
          if (new BigNumber(value).gt(calc.value))
            return { isDisabled: calc.isDisabled, title: calc.reason };
        }
        return undefined;
      };

      return {
        action: Action.WITHDRAW,
        actionPastTense: "withdrew",
        getMaxValue,
        getNewCalculations,
        getSubmitButtonState,
        submit: withdraw,
      };
    } else if (selectedTab === Tab.REPAY) {
      const maxCalculations = (() => {
        const coinBalanceForReserve =
          data.coinBalancesMap[reserve.coinType]?.balance ?? new BigNumber("0");
        const position = obligation?.borrows.find(
          (borrow) => borrow.coinType === reserve.coinType,
        );
        const borrowedAmount = position?.borrowedAmount ?? new BigNumber("0");

        const result = [
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
          result.push({
            reason: `Min ${SUI_REPAY_GAS_MIN} SUI should be saved for gas`,
            isDisabled: true,
            value: coinBalanceForReserve.minus(SUI_REPAY_GAS_MIN),
          });

        return result;
      })();

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

        const newBorrowUtilization =
          !valueObj.isNaN() && !obligation.minPriceBorrowLimitUsd.eq(0)
            ? obligation.borrowedAmountUsd
                .minus(
                  valueObj
                    .times(reserve.maxPrice)
                    .times(reserve.config.borrowFeeBps / 10000),
                )
                .div(obligation.minPriceBorrowLimitUsd)
            : null;

        return {
          newBorrowLimitUsd: null,
          newBorrowUtilization: newBorrowUtilization
            ? BigNumber.max(BigNumber.min(1, newBorrowUtilization), 0)
            : null,
        };
      };

      const getSubmitButtonState = (value: string) => {
        for (const calc of maxCalculations) {
          if (new BigNumber(value).gt(calc.value))
            return { isDisabled: calc.isDisabled, title: calc.reason };
        }
        return undefined;
      };

      return {
        action: Action.REPAY,
        actionPastTense: "repaid",
        getMaxValue,
        getNewCalculations,
        getSubmitButtonState,
        submit: repay,
      };
    }
  }, [
    selectedTab,
    reserve,
    data.coinBalancesMap,
    obligation,
    data.lendingMarket.rateLimiter.remainingOutflow,
    deposit,
    borrow,
    withdraw,
    repay,
  ]);

  return (
    <ActionsModalContainer>
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={(tab) => setSelectedTab(tab as Tab)}
      >
        <div
          className="flex flex-col gap-4 md:!h-auto md:flex-row md:items-stretch"
          style={{
            height: isMoreParametersOpen
              ? `calc(100dvh - ${0 /* Drawer margin-top */}px - ${1 /* Drawer border-top */}px - ${16 /* Drawer padding-top */}px - ${70 /* Tabs */}px - ${16 /* Drawer padding-bottom */}px - ${1 /* Drawer border-bottom */}px)`
              : "auto",
          }}
        >
          {reserve && tabConfig && (
            <>
              <div className="flex h-full w-full flex-col gap-4 md:h-auto md:w-[460px]">
                <ActionsModalTabContent reserve={reserve} {...tabConfig} />
              </div>

              {md && isMoreParametersOpen && (
                <div className="flex w-[500px] flex-col gap-4 rounded-md border p-4">
                  <ParametersPanel reserve={reserve} />
                </div>
              )}
            </>
          )}
        </div>
      </Tabs>
    </ActionsModalContainer>
  );
}
