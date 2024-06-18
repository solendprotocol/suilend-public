import { forwardRef, useEffect, useRef } from "react";

import { VerifiedToken } from "@hop.ag/sdk";
import BigNumber from "bignumber.js";
import { mergeRefs } from "react-merge-refs";

import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TLabel, TLabelSans } from "@/components/shared/Typography";
import { Input as InputComponent } from "@/components/ui/input";
import { formatPercent, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const INPUT_HEIGHT = 70; // px
const USD_LABEL_HEIGHT = 16; // px
const INPUT_PADDING_Y = INPUT_HEIGHT / 2 - (32 + USD_LABEL_HEIGHT) / 2; // px

interface SwapInputProps {
  title?: string;
  autoFocus?: boolean;
  value: string;
  isValueLoading?: boolean;
  onChange?: (value: string) => void;
  token: VerifiedToken;
  usdValue?: BigNumber;
  usdValueChangePercent?: BigNumber;
}

const SwapInput = forwardRef<HTMLInputElement, SwapInputProps>(
  (
    {
      title,
      autoFocus,
      value,
      isValueLoading,
      onChange,
      token,
      usdValue,
      usdValueChangePercent,
    },
    ref,
  ) => {
    // Autofocus
    const localRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      if (!autoFocus) return;
      setTimeout(() => localRef.current?.focus());
    }, [autoFocus]);

    const isReadOnly = !onChange;

    return (
      <div
        className={cn(
          "w-full rounded-lg border bg-background",
          !isReadOnly && "border-primary",
        )}
      >
        <div
          className={cn(
            "flex w-full flex-col rounded-[7px]",
            isValueLoading && "animate-pulse bg-muted/10",
          )}
        >
          {title && (
            <TLabelSans className="-mb-1 px-3 pt-3">{title}</TLabelSans>
          )}

          <div className="relative w-full">
            <InputComponent
              ref={mergeRefs([localRef, ref])}
              className="relative z-[1] border-0 bg-transparent px-0 py-0 text-2xl transition-opacity [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              type="number"
              placeholder="0"
              value={value}
              readOnly={isReadOnly}
              onChange={
                !isReadOnly ? (e) => onChange(e.target.value) : undefined
              }
              style={{
                height: `${INPUT_HEIGHT}px`,
                paddingLeft: `${3 * 4}px`,
                paddingRight: `${3 * 4 + Math.max(5 * 4 + 2 * 4 + token.ticker.length * 14.4) + 3 * 4}px`,
                paddingTop: `${INPUT_PADDING_Y}px`,
                paddingBottom: `${INPUT_PADDING_Y + USD_LABEL_HEIGHT}px`,
              }}
              step="any"
            />

            {new BigNumber(value || 0).gt(0) &&
              usdValue !== undefined &&
              !usdValue.eq(0) && (
                <TLabel
                  className="absolute left-3 z-[2]"
                  style={{ bottom: `${INPUT_PADDING_Y}px` }}
                >
                  ≈{formatUsd(usdValue)}
                  {usdValueChangePercent !== undefined &&
                    !usdValueChangePercent.eq(0) && (
                      <span
                        className={cn(
                          usdValueChangePercent.gt(0) && "text-success",
                          usdValueChangePercent.lt(0) && "text-destructive",
                        )}
                      >
                        {" ("}
                        {usdValueChangePercent.gt(0) && "+"}
                        {usdValueChangePercent.lt(0) && "-"}
                        {formatPercent(usdValueChangePercent.abs())}
                        {")"}
                      </span>
                    )}
                </TLabel>
              )}

            <div
              className="absolute right-3 z-[2] flex flex-row items-center gap-2"
              style={{ top: `${INPUT_PADDING_Y}px` }}
            >
              <TokenLogo
                className="h-5 w-5"
                coinType={token.coin_type}
                symbol={token.ticker}
                src={token.icon_url}
              />
              <TBody className="text-right text-2xl">{token.ticker}</TBody>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
SwapInput.displayName = "SwapInput";

export default SwapInput;
