import { useCallback, useEffect, useRef, useState } from "react";

import BigNumber from "bignumber.js";
import { capitalize } from "lodash";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { maxU64 } from "@suilend/sdk/constants";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import { useActionsModalContext } from "@/components/dashboard/actions-modal/ActionsModalContext";
import ActionsModalInput from "@/components/dashboard/actions-modal/ActionsModalInput";
import ParametersPanel from "@/components/dashboard/actions-modal/ParametersPanel";
import AprWithRewardsBreakdown from "@/components/dashboard/AprWithRewardsBreakdown";
import Button from "@/components/shared/Button";
import LabelWithValue from "@/components/shared/LabelWithValue";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import { TLabelSans } from "@/components/shared/Typography";
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

export type SubmitButtonState = {
  isLoading?: boolean;
  isDisabled?: boolean;
  title?: string;
};

interface ActionsModalTabContentProps {
  action: Action;
  actionPastTense: string;
  reserve: ParsedReserve;
  getMaxValue: () => string;
  getSubmitButtonNoValueState?: () => SubmitButtonState | undefined;
  getSubmitButtonState: (value: string) => SubmitButtonState | undefined;
  submit: ActionSignature;
  getNewCalculations: (value: string) => {
    newBorrowLimit: BigNumber | null;
    newBorrowUtilization: BigNumber | null;
  };
}

export default function ActionsModalTabContent({
  action,
  actionPastTense,
  reserve,
  getMaxValue,
  getSubmitButtonNoValueState,
  getSubmitButtonState,
  submit,
  getNewCalculations,
}: ActionsModalTabContentProps) {
  const { address } = useWalletContext();
  const { refreshData, explorer, obligation, ...restAppContext } =
    useAppContext();
  const data = restAppContext.data as AppData;

  const { isMoreParametersOpen, setIsMoreParametersOpen } =
    useActionsModalContext();
  const MoreParametersIcon = isMoreParametersOpen ? ChevronUp : ChevronDown;

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
  const { newBorrowLimit, newBorrowUtilization } = getNewCalculations(value);

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

  const formattedValue = `${value} ${reserve.symbol}`;

  // Rewards
  const rewards = data.rewardMap[reserve.coinType];

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
      <ActionsModalInput
        ref={inputRef}
        value={value}
        onChange={onValueChange}
        reserve={reserve}
        useMaxAmount={useMaxAmount}
        onMaxClick={setMaxValue}
      />

      <div className="-m-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:min-h-[200px]">
        <div
          className="flex flex-col gap-3"
          style={{ height: 5 * 20 + (5 - 1) * (3 * 4) }}
        >
          <LabelWithValue
            label="Price"
            value={formatPrice(reserve.price)}
            labelTooltip="The price of the asset in USD"
            horizontal
          />
          <LabelWithValue
            label="User borrow limit"
            value={
              newBorrowLimit
                ? `${formatUsd(obligation?.borrowLimitUsd ?? new BigNumber("0"))} → ${formatUsd(newBorrowLimit)}`
                : formatUsd(obligation?.borrowLimitUsd ?? new BigNumber("0"))
            }
            horizontal
          />
          <LabelWithValue
            label="Utilization"
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
                rewards={rewards?.[side] ?? []}
                reserve={reserve}
                amountChange={valueChange}
              />
            }
            horizontal
            value="0"
          />
          {action === Action.BORROW && (
            <LabelWithValue
              label="Borrow fee"
              value={`${formatToken(new BigNumber(value || "0").times(reserve.config.borrowFeeBps).div(10000), { dp: reserve.mintDecimals })} ${reserve.symbol}`}
              horizontal
            />
          )}
        </div>

        {!md && isMoreParametersOpen && (
          <>
            <Separator />
            <ParametersPanel reserve={reserve} />
          </>
        )}
      </div>

      <div className="flex w-full flex-col gap-2">
        {!md && (
          <Button
            className="justify-between"
            labelClassName="uppercase"
            endIcon={<MoreParametersIcon className="h-4 w-4" />}
            variant="secondary"
            onClick={() => setIsMoreParametersOpen((o) => !o)}
          >
            {isMoreParametersOpen ? "Hide" : "Show"} more parameters
          </Button>
        )}

        <Button
          className="h-auto min-h-14"
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
        </Button>
      </div>

      <div className="flex flex-row flex-wrap justify-between gap-x-2 gap-y-1">
        <TLabelSans onClick={setMaxValue}>
          {`${formatToken(balance, { dp: reserve.mintDecimals })} ${reserve.symbol} in wallet`}
        </TLabelSans>

        <TLabelSans>
          {`${formatToken(positionAmount, { dp: reserve.mintDecimals })} ${reserve.symbol} ${side === Side.DEPOSIT ? "deposited" : "borrowed"}`}
        </TLabelSans>
      </div>
    </>
  );
}
