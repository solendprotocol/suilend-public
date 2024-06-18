import { useCallback, useEffect, useRef, useState } from "react";

import BigNumber from "bignumber.js";
import { capitalize } from "lodash";
import { toast } from "sonner";

import { maxU64 } from "@suilend/sdk/constants";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import {
  ActionSignature,
  useActionsModalContext,
} from "@/components/dashboard/actions-modal/ActionsModalContext";
import ActionsModalInput from "@/components/dashboard/actions-modal/ActionsModalInput";
import ParametersPanel from "@/components/dashboard/actions-modal/ParametersPanel";
import AprWithRewardsBreakdown from "@/components/dashboard/AprWithRewardsBreakdown";
import Button from "@/components/shared/Button";
import Collapsible from "@/components/shared/Collapsible";
import LabelWithValue from "@/components/shared/LabelWithValue";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
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
  side: Side;
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
  side,
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

  const { md } = useBreakpoint();

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
      : borrowPosition?.borrowedAmount) ?? new BigNumber(0);

  // Value
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>("");

  const [useMaxAmount, setUseMaxAmount] = useState<boolean>(false);
  const maxAmount = getMaxValue();

  const formatAndSetValue = useCallback(
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
    formatAndSetValue(_value);
  };

  const useMaxValueWrapper = () => {
    setUseMaxAmount(true);
    formatAndSetValue(maxAmount);
  };

  useEffect(() => {
    // If user has specified intent to use max amount, we continue this intent
    // even if the max value updates
    if (useMaxAmount) formatAndSetValue(maxAmount);
  }, [useMaxAmount, maxAmount, formatAndSetValue]);

  const { newBorrowLimitUsd, newBorrowUtilization } = getNewCalculations(value);

  const formattedValue = `${value} ${reserve.symbol}`;

  // Borrow fee
  const borrowFee = new BigNumber(value || 0)
    .times(reserve.config.borrowFeeBps)
    .div(10000);

  // Submit
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitButtonState: SubmitButtonState = (() => {
    if (!address) return { isDisabled: true, title: "Connect wallet" };
    if (isSubmitting) return { isDisabled: true, isLoading: true };

    if (
      getSubmitButtonNoValueState !== undefined &&
      getSubmitButtonNoValueState() !== undefined
    )
      return getSubmitButtonNoValueState() as SubmitButtonState;

    if (value === "") return { isDisabled: true, title: "Enter an amount" };
    if (new BigNumber(value).lt(0))
      return { isDisabled: true, title: "Enter a +ve amount" };
    if (new BigNumber(value).eq(0))
      return { isDisabled: true, title: "Enter a non-zero amount" };

    if (getSubmitButtonState(value) !== undefined)
      return getSubmitButtonState(value) as SubmitButtonState;

    return {
      title: `${capitalize(action)} ${formattedValue}`,
      description:
        action === Action.BORROW
          ? `+${formatToken(borrowFee, { dp: reserve.mintDecimals })} ${reserve.symbol} in fees`
          : undefined,
    };
  })();

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
      <div className="relative flex w-full flex-col">
        <div className="relative z-[2] w-full">
          <ActionsModalInput
            ref={inputRef}
            value={value}
            onChange={onValueChange}
            reserve={reserve}
            action={action}
            useMaxAmount={useMaxAmount}
            onMaxClick={useMaxValueWrapper}
          />
        </div>

        <div className="relative z-[1] -mt-2 flex w-full flex-row flex-wrap justify-between gap-x-2 gap-y-1 rounded-b-md bg-primary/25 px-3 pb-2 pt-4">
          <div
            className={cn(
              "flex flex-row items-center gap-2",
              [Action.DEPOSIT].includes(action) && "cursor-pointer",
            )}
            onClick={
              [Action.DEPOSIT].includes(action) ? useMaxValueWrapper : undefined
            }
          >
            <TLabelSans>Balance</TLabelSans>
            <TBody
              className={cn(
                "text-xs",
                [Action.DEPOSIT].includes(action) &&
                  cn("decoration-foreground/50", hoverUnderlineClassName),
              )}
            >
              {formatToken(balance, { exact: false })} {reserve.symbol}
            </TBody>
          </div>

          <div
            className={cn(
              "flex flex-row items-center gap-2",
              [Action.WITHDRAW, Action.REPAY].includes(action) &&
                "cursor-pointer",
            )}
            onClick={
              [Action.WITHDRAW, Action.REPAY].includes(action)
                ? useMaxValueWrapper
                : undefined
            }
          >
            <TLabelSans>
              {side === Side.DEPOSIT ? "Deposited" : "Borrowed"}
            </TLabelSans>
            <TBody
              className={cn(
                "text-xs",
                [Action.WITHDRAW, Action.REPAY].includes(action) &&
                  cn("decoration-foreground/50", hoverUnderlineClassName),
              )}
            >
              {formatToken(positionAmount, { exact: false })} {reserve.symbol}
            </TBody>
          </div>
        </div>
      </div>

      <div className="-m-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 md:pb-6">
        <div className="flex flex-col gap-3">
          <LabelWithValue
            label="Price"
            value={formatPrice(reserve.price)}
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
              !obligation
                ? "N/A"
                : newBorrowLimitUsd
                  ? `${formatUsd(obligation.minPriceBorrowLimitUsd)} → ${formatUsd(newBorrowLimitUsd)}`
                  : formatUsd(obligation.minPriceBorrowLimitUsd)
            }
            horizontal
          />
          <LabelWithValue
            label="Your utilization"
            value={
              !obligation
                ? "N/A"
                : newBorrowUtilization
                  ? `${formatPercent(obligation.weightedConservativeBorrowUtilizationPercent)} → ${formatPercent(newBorrowUtilization.times(100))}`
                  : formatPercent(
                      obligation.weightedConservativeBorrowUtilizationPercent,
                    )
            }
            horizontal
          />
        </div>

        {!md && isMoreParametersOpen && (
          <>
            <Separator />
            <ParametersPanel side={side} reserve={reserve} />
          </>
        )}
      </div>

      <div className="flex w-full flex-col gap-2">
        {!md && (
          <Collapsible
            open={isMoreParametersOpen}
            onOpenChange={setIsMoreParametersOpen}
            title={`${isMoreParametersOpen ? "Less" : "More"} parameters`}
            openTitle="Less parameters"
            buttonClassName="!bg-popover py-1"
            buttonLabelClassName="text-xs"
            hasSeparator
          />
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
