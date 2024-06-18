import { forwardRef, useEffect, useRef } from "react";

import { VerifiedToken } from "@hop.ag/sdk";
import BigNumber from "bignumber.js";
import { mergeRefs } from "react-merge-refs";

import Select from "@/components/shared/Select";
import TokenLogo from "@/components/shared/TokenLogo";
import { TLabel, TLabelSans } from "@/components/shared/Typography";
import { Input as InputComponent } from "@/components/ui/input";
import { SelectTrigger } from "@/components/ui/select";
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
  tokens: VerifiedToken[];
  token: VerifiedToken;
  onTokenChange: (coinType: string) => void;
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
      tokens,
      token,
      onTokenChange,
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
              className="relative z-[1] border-0 bg-transparent px-0 py-0 text-2xl"
              type="number"
              placeholder="0"
              value={value}
              readOnly={isReadOnly}
              onChange={
                !isReadOnly ? (e) => onChange(e.target.value) : undefined
              }
              onWheel={(e) => e.currentTarget.blur()}
              style={{
                height: `${INPUT_HEIGHT}px`,
                paddingLeft: `${3 * 4}px`,
                paddingRight: `${3 * 4 + (5 * 4 + 2 * 4 + token.ticker.length * 14.4 + 1 * 4 + 4 * 4) + 3 * 4}px`,
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
                  {formatUsd(usdValue)}
                  {usdValueChangePercent !== undefined &&
                    !usdValueChangePercent.eq(0) && (
                      <span
                        className={cn(
                          usdValueChangePercent.gt(0) && "text-success",
                          usdValueChangePercent.lt(0) && "text-destructive",
                        )}
                      >
                        {" "}
                        {usdValueChangePercent.gt(0) && "+"}
                        {usdValueChangePercent.lt(0) && "-"}
                        {formatPercent(usdValueChangePercent.abs())}
                      </span>
                    )}
                </TLabel>
              )}

            <div
              className="absolute right-3 z-[2]"
              style={{ top: `${INPUT_PADDING_Y}px` }}
            >
              <Select
                trigger={
                  <SelectTrigger
                    className={cn(
                      "h-8 w-fit gap-1 border-none bg-transparent p-0 font-mono text-2xl text-foreground ring-offset-transparent transition-colors hover:text-foreground focus:ring-transparent",
                    )}
                    startIcon={
                      <TokenLogo
                        className="mr-1 h-5 w-5"
                        coinType={token.coin_type}
                        symbol={token.ticker}
                        src={token.icon_url}
                      />
                    }
                  >
                    {token.ticker}
                  </SelectTrigger>
                }
                items={tokens.map((_token) => ({
                  id: _token.coin_type,
                  name: _token.ticker,
                }))}
                selectedItemId={token.coin_type}
                setValue={onTokenChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);
SwapInput.displayName = "SwapInput";

export default SwapInput;
