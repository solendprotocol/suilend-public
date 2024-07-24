import { forwardRef, useEffect, useRef } from "react";

import { VerifiedToken } from "@hop.ag/sdk";
import BigNumber from "bignumber.js";
import { Wallet } from "lucide-react";
import { mergeRefs } from "react-merge-refs";

import { TLabel, TLabelSans } from "@/components/shared/Typography";
import TokenSelectionDialog from "@/components/swap/TokenSelectionDialog";
import { Input as InputComponent } from "@/components/ui/input";
import { useSwapContext } from "@/contexts/SwapContext";
import { ParsedCoinBalance } from "@/lib/coinBalance";
import { formatToken, formatUsd } from "@/lib/format";
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
  usdValue?: BigNumber;
  tokens: VerifiedToken[];
  token: VerifiedToken;
  onSelectToken: (token: VerifiedToken) => void;
}

const SwapInput = forwardRef<HTMLInputElement, SwapInputProps>(
  (
    {
      title,
      autoFocus,
      value,
      isValueLoading,
      onChange,
      usdValue,
      tokens,
      token,
      onSelectToken,
    },
    ref,
  ) => {
    const swapContext = useSwapContext();
    const coinBalancesMap = swapContext.coinBalancesMap as Record<
      string,
      ParsedCoinBalance
    >;

    const tokenBalance =
      coinBalancesMap[token.coin_type]?.balance ?? new BigNumber(0);

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
          "w-full rounded-md border bg-background",
          !isReadOnly && "border-primary",
        )}
      >
        <div
          className={cn(
            "flex w-full flex-col rounded-[7px]",
            isValueLoading && "animate-pulse bg-muted/10",
          )}
        >
          {title && <TLabelSans className="px-3 pt-3">{title}</TLabelSans>}

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
                </TLabel>
              )}

            <div
              className="absolute right-3 z-[2] flex h-8 flex-col items-end justify-center gap-1"
              style={{ top: `${INPUT_PADDING_Y}px` }}
            >
              <TokenSelectionDialog
                tokens={tokens}
                token={token}
                onSelectToken={onSelectToken}
              />

              <div className="flex flex-row items-center gap-1.5 pr-2">
                <Wallet className="h-3 w-3 text-muted-foreground" />
                <TLabel>
                  {formatToken(tokenBalance)} {token.ticker}
                </TLabel>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
SwapInput.displayName = "SwapInput";

export default SwapInput;
