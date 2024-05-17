import { useCallback, useEffect, useRef, useState } from "react";

import BigNumber from "bignumber.js";
import { capitalize } from "lodash";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  HandCoins,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { maxU64 } from "@suilend/sdk/constants";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import { useActionsModalContext } from "@/components/dashboard/actions-modal/ActionsModalContext";
import ActionsModalInput from "@/components/dashboard/actions-modal/ActionsModalInput";
import HistoricalAprLineChart from "@/components/dashboard/actions-modal/HistoricalAprLineChart";
import ParametersPanel from "@/components/dashboard/actions-modal/ParametersPanel";
import PythLogo from "@/components/dashboard/actions-modal/PythLogo";
import AprWithRewardsBreakdown from "@/components/dashboard/AprWithRewardsBreakdown";
import Button from "@/components/shared/Button";
import LabelWithValue from "@/components/shared/LabelWithValue";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import { TBody } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { ActionSignature } from "@/contexts/DashboardContext";
import { useWalletContext } from "@/contexts/WalletContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import { isSui } from "@/lib/coinType";
import { SUI_REPAY_GAS_MIN, TX_TOAST_DURATION } from "@/lib/constants";
import {
  formatPercent,
  formatPrice,
  formatToken,
  formatUsd,
} from "@/lib/format";
import { Action } from "@/lib/types";
import { cn, hoverUnderlineClassName } from "@/lib/utils";

export type SubmitButtonState = {
  isLoading?: boolean;
  isDisabled?: boolean;
  title?: string;
  description?: string;
};

interface ActionsModalTabContentProps {
  reserve: ParsedReserve;
  action: Action;
  actionPastTense: string;
  getMaxValue: () => string;
  getNewCalculations: (value: string) => {
    newBorrowLimitUsd: BigNumber | null;
    newBorrowUtilization: BigNumber | null;
  };
  getSubmitButtonNoValueState?: () => SubmitButtonState | undefined;
  getSubmitButtonState: (value: string) => SubmitButtonState | undefined;
  submit: ActionSignature;
}

export default function ActionsModalTabContent({
  reserve,
  action,
  actionPastTense,
  getMaxValue,
  getNewCalculations,
  getSubmitButtonNoValueState,
  getSubmitButtonState,
  submit,
}: ActionsModalTabContentProps) {
  const { address } = useWalletContext();
  const { refreshData, explorer, obligation, ...restAppContext } =
    useAppContext();
  const data = restAppContext.data as AppData;
  const { isMoreParametersOpen, setIsMoreParametersOpen } =
    useActionsModalContext();
  const MoreParametersIcon = isMoreParametersOpen
    ? ChevronsDownUp
    : ChevronsUpDown;

  const { md } = useBreakpoint();

  const side = [Action.DEPOSIT, Action.WITHDRAW].includes(action)
    ? Side.DEPOSIT
    : Side.BORROW;

  // Balance
  const balance =
    data.coinBalancesMap[reserve.coinType]?.balance ?? new BigNumber(0);

  // Position
  const depositPosition = obligation?.deposits?.find(
    (d) => d.coinType === reserve.coinType,
  );
  const borrowPosition = obligation?.borrows?.find(
    (b) => b.coinType === reserve.coinType,
  );
  const positionAmount =
    (side === Side.DEPOSIT
      ? depositPosition?.depositedAmount
      : borrowPosition?.borrowedAmount) ?? new BigNumber("0");

  // Value
  const [useMaxAmount, setUseMaxAmount] = useState<boolean>(false);
  const maxAmount = getMaxValue();

  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>("");

  const onValueChangeCore = useCallback(
    (_value: string) => {
      if (_value.includes(".")) {
        const [whole, decimals] = _value.split(".");
        setValue(
          `${whole}.${decimals.slice(0, Math.min(decimals.length, reserve.mintDecimals))}`,
        );
      } else setValue(_value);
    },
    [reserve.mintDecimals],
  );

  const onValueChange = (_value: string) => {
    if (useMaxAmount) setUseMaxAmount(false);
    onValueChangeCore(_value);
  };

  const setMaxValue = () => {
    setUseMaxAmount(true);
    onValueChangeCore(maxAmount);
    inputRef.current?.focus();
  };

  useEffect(() => {
    // If user has specified intent to use max amount, we continue this intent
    // even if the max value updates
    if (useMaxAmount) onValueChangeCore(maxAmount);
  }, [useMaxAmount, maxAmount, onValueChangeCore]);

  const { newBorrowLimitUsd, newBorrowUtilization } = getNewCalculations(value);

  const formattedValue = `${value} ${reserve.symbol}`;

  // Borrow fee
  const borrowFee = new BigNumber(value || "0")
    .times(reserve.config.borrowFeeBps)
    .div(10000);

  // Submit
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getSubmitButtonStateWrapper = (): SubmitButtonState => {
    if (!address) return { isDisabled: true, title: "Connect wallet" };
    if (isSubmitting) return { isDisabled: true, isLoading: true };

    if (
      getSubmitButtonNoValueState !== undefined &&
      getSubmitButtonNoValueState() !== undefined
    )
      return getSubmitButtonNoValueState() as SubmitButtonState;

    if (value === "") return { isDisabled: true, title: "Enter a value" };
    if (new BigNumber(value).lt(0))
      return { isDisabled: true, title: "Enter a +ve value" };
    if (new BigNumber(value).eq(0))
      return { isDisabled: true, title: "Enter a non-zero value" };

    if (getSubmitButtonState(value) !== undefined)
      return getSubmitButtonState(value) as SubmitButtonState;

    return {
      title: `${capitalize(action)} ${formattedValue}`,
      description:
        action === Action.BORROW
          ? `+${formatToken(borrowFee, { dp: reserve.mintDecimals })} ${reserve.symbol} in fees`
          : undefined,
    };
  };
  const submitButtonState = getSubmitButtonStateWrapper();

  const onSubmitClick = async () => {
    if (submitButtonState.isDisabled) return;

    setIsSubmitting(true);

    let submitAmount = new BigNumber(value)
      .times(10 ** reserve.mintDecimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString();

    switch (action) {
      case Action.DEPOSIT: {
        break;
      }
      case Action.WITHDRAW: {
        if (useMaxAmount) submitAmount = maxU64.toString();
        else
          submitAmount = new BigNumber(submitAmount)
            .div(reserve.cTokenExchangeRate)
            .integerValue(BigNumber.ROUND_DOWN)
            .toString();
        break;
      }
      case Action.BORROW: {
        if (useMaxAmount) submitAmount = maxU64.toString();
        break;
      }
      case Action.REPAY: {
        if (useMaxAmount) {
          if (isSui(reserve.coinType)) {
            submitAmount = balance
              .minus(new BigNumber(SUI_REPAY_GAS_MIN))
              .times(10 ** reserve.mintDecimals)
              .toString();
          } else {
            submitAmount = balance.times(10 ** reserve.mintDecimals).toString();
          }
        }
        break;
      }
      default: {
        break;
      }
    }

    try {
      const res = await submit(reserve.coinType, submitAmount);
      const txUrl = explorer.buildTxUrl(res.digest);

      toast.success(`${capitalize(actionPastTense)} ${formattedValue}`, {
        action: <TextLink href={txUrl}>View tx on {explorer.name}</TextLink>,
        duration: TX_TOAST_DURATION,
      });
      setUseMaxAmount(false);
      setValue("");
    } catch (err) {
      toast.error(`Failed to ${action.toLowerCase()} ${formattedValue}`, {
        description: ((err as Error)?.message || err) as string,
        duration: TX_TOAST_DURATION,
      });
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
      await refreshData();
    }
  };

  let valueChange = undefined;
  if (value.length && !new BigNumber(value).isNaN()) {
    valueChange = [Action.DEPOSIT, Action.BORROW].includes(action)
      ? new BigNumber(value)
      : new BigNumber(value).negated();
  }

  return (
    <>
      <div className="flex w-full flex-col">
        <div className="relative z-[2] w-full">
          <ActionsModalInput
            ref={inputRef}
            value={value}
            onChange={onValueChange}
            reserve={reserve}
            action={action}
            useMaxAmount={useMaxAmount}
            onMaxClick={setMaxValue}
          />
        </div>

        <div className="relative z-[1] -mt-2 flex w-full flex-row flex-wrap justify-between gap-x-2 gap-y-1 rounded-b-md bg-card px-2 pb-2 pt-4">
          <div
            className={cn(
              "flex flex-row items-center gap-1",
              [Action.DEPOSIT].includes(action) && "cursor-pointer",
            )}
            onClick={
              [Action.DEPOSIT].includes(action) ? setMaxValue : undefined
            }
          >
            <Wallet className="h-3 w-3 text-foreground" />
            <TBody
              className={cn(
                "text-xs",
                [Action.DEPOSIT].includes(action) &&
                  cn("decoration-foreground/50", hoverUnderlineClassName),
              )}
            >
              {formatToken(balance, { dp: reserve.mintDecimals })}{" "}
              {reserve.symbol}
            </TBody>
          </div>

          <div
            className={cn(
              "flex flex-row items-center gap-1",
              [Action.WITHDRAW, Action.REPAY].includes(action) &&
                "cursor-pointer",
            )}
            onClick={
              [Action.WITHDRAW, Action.REPAY].includes(action)
                ? setMaxValue
                : undefined
            }
          >
            {side === Side.DEPOSIT ? (
              <PiggyBank className="h-3 w-3 text-foreground" />
            ) : (
              <HandCoins className="h-3 w-3 text-foreground" />
            )}
            <TBody
              className={cn(
                "text-xs",
                [Action.WITHDRAW, Action.REPAY].includes(action) &&
                  cn("decoration-foreground/50", hoverUnderlineClassName),
              )}
            >
              {formatToken(positionAmount, { dp: reserve.mintDecimals })}{" "}
              {reserve.symbol}
            </TBody>
          </div>
        </div>
      </div>

      <div className="-m-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
        <div className="flex flex-col gap-2.5">
          <LabelWithValue
            label="Price"
            value={formatPrice(reserve.price)}
            labelEndDecorator={<PythLogo />}
            horizontal
          />
          <LabelWithValue
            label={`${capitalize(side)} APR`}
            customChild={
              <AprWithRewardsBreakdown
                side={side}
                aprPercent={
                  side === Side.DEPOSIT
                    ? reserve.depositAprPercent
                    : reserve.borrowAprPercent
                }
                rewards={data.rewardMap[reserve.coinType]?.[side] ?? []}
                reserve={reserve}
                amountChange={valueChange}
              />
            }
            horizontal
            value="0"
          />
          <LabelWithValue
            label="Your borrow limit"
            value={
              newBorrowLimitUsd
                ? `${formatUsd(obligation?.minPriceBorrowLimitUsd ?? new BigNumber("0"))} → ${formatUsd(newBorrowLimitUsd)}`
                : formatUsd(
                    obligation?.minPriceBorrowLimitUsd ?? new BigNumber("0"),
                  )
            }
            horizontal
          />
          <LabelWithValue
            label="Your utilization"
            value={
              newBorrowUtilization
                ? `${formatPercent(obligation?.weightedConservativeBorrowUtilizationPercent ?? new BigNumber(0))} → ${formatPercent(newBorrowUtilization.times(100))}`
                : formatPercent(
                    obligation?.weightedConservativeBorrowUtilizationPercent ??
                      new BigNumber(0),
                  )
            }
            horizontal
          />
        </div>

        <HistoricalAprLineChart reserveId={reserve.id} side={side} />

        {!md && isMoreParametersOpen && (
          <>
            <Separator />
            <ParametersPanel reserve={reserve} />
          </>
        )}
      </div>

      <div className="flex w-full flex-row items-stretch gap-[2px]">
        {!md && (
          <Button
            className="h-auto w-14 flex-col px-0 py-0"
            labelClassName="uppercase text-xs"
            startIcon={<MoreParametersIcon className="h-4 w-4" />}
            variant="secondary"
            onClick={() => setIsMoreParametersOpen((o) => !o)}
          >
            Params
          </Button>
        )}

        <Button
          className="h-auto min-h-12 flex-1 py-1 md:min-h-14 md:py-2"
          labelClassName="text-wrap uppercase"
          style={{ overflowWrap: "anywhere" }}
          disabled={submitButtonState.isDisabled}
          onClick={onSubmitClick}
        >
          {submitButtonState.isLoading ? (
            <Spinner size="md" />
          ) : (
            submitButtonState.title
          )}

          {submitButtonState.description && (
            <span className="block font-sans text-xs normal-case opacity-75">
              {submitButtonState.description}
            </span>
          )}
        </Button>
      </div>
    </>
  );
}
