import { forwardRef, useEffect, useRef } from "react";

import { VerifiedToken } from "@hop.ag/sdk";
import { mergeRefs } from "react-merge-refs";

import TokenLogo from "@/components/shared/TokenLogo";
import { TBody } from "@/components/shared/Typography";
import { Input as InputComponent } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const INPUT_HEIGHT = 70; // px

interface SwapInputProps {
  autoFocus?: boolean;
  value: string;
  isValueLoading?: boolean;
  onChange?: (value: string) => void;
  token: VerifiedToken;
}

const SwapInput = forwardRef<HTMLInputElement, SwapInputProps>(
  ({ autoFocus, value, isValueLoading, onChange, token }, ref) => {
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
          "relative w-full rounded-lg border bg-background",
          !isReadOnly && "border-primary",
        )}
      >
        <InputComponent
          ref={mergeRefs([localRef, ref])}
          className={cn(
            "relative z-[1] border-0 bg-transparent px-0 py-0 text-right text-2xl transition-opacity [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            isValueLoading && "animate-pulse bg-muted/10",
          )}
          type="number"
          placeholder="0"
          value={value}
          readOnly={isReadOnly}
          onChange={!isReadOnly ? (e) => onChange(e.target.value) : undefined}
          style={{
            height: `${INPUT_HEIGHT}px`,
            paddingLeft: `${4 * 4 + Math.max(5 * 4 + 2 * 4 + token.ticker.length * 14.4) + 3 * 4}px`,
            paddingRight: `${4 * 4}px`,
          }}
          step="any"
        />
        <div
          className="absolute left-0 top-0 z-[2] flex flex-row items-center gap-2 pl-4 pr-3"
          style={{ height: `${INPUT_HEIGHT}px` }}
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
    );
  },
);
SwapInput.displayName = "SwapInput";

export default SwapInput;
