import { forwardRef, useEffect, useRef } from "react";

import BigNumber from "bignumber.js";
import { mergeRefs } from "react-merge-refs";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import Button from "@/components/shared/Button";
import { TBody, TLabel } from "@/components/shared/Typography";
import { Input as InputComponent } from "@/components/ui/input";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export const getActionInputId = (id: string) => `action-input.${id}`;

interface ActionsModalInputProps {
  value: string;
  onChange: (value: string) => void;
  reserve: ParsedReserve;
  useMaxAmount: boolean;
  onMaxClick: () => void;
}

const ActionsModalInput = forwardRef<HTMLInputElement, ActionsModalInputProps>(
  ({ value, onChange, reserve, useMaxAmount, onMaxClick }, ref) => {
    const actionInputId = getActionInputId("value");

    const localRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
      setTimeout(() => localRef.current?.focus());
    }, []);

    const INPUT_HEIGHT = 80; // px
    const INPUT_BORDER_Y = 1; // px
    const INPUT_INNER_HEIGHT = INPUT_HEIGHT - 2 * INPUT_BORDER_Y; // px
    const MAX_BUTTON_WIDTH = 60; // px
    const MAX_BUTTON_HEIGHT = 8 + 28 + 8; // px
    const USD_LABEL_HEIGHT = 16; // px

    return (
      <div className="relative w-full">
        <div className="absolute left-4 top-1/2 z-[2] -translate-y-2/4">
          <Button
            className={cn(
              "rounded-md uppercase",
              useMaxAmount &&
                "border-secondary bg-secondary/5 text-primary-foreground",
            )}
            variant="secondaryOutline"
            onClick={onMaxClick}
            style={{
              width: `${MAX_BUTTON_WIDTH}px`,
              height: `${MAX_BUTTON_HEIGHT}px`,
            }}
          >
            Max
          </Button>
        </div>

        <InputComponent
          ref={mergeRefs([localRef, ref])}
          id={actionInputId}
          className="relative z-[1] flex-1 border-primary bg-card px-0 py-0 text-right text-2xl shadow-3xl shadow-primary ring-offset-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            height: `${INPUT_HEIGHT}px`,
            paddingLeft: `${4 * 4 + MAX_BUTTON_WIDTH + 3 * 4}px`,
            paddingRight: `${3 * 4 + reserve.symbol.length * 14.4 + 4 * 4}px`,
            paddingTop: `${(INPUT_INNER_HEIGHT - MAX_BUTTON_HEIGHT) / 2}px`,
            paddingBottom: `${(INPUT_INNER_HEIGHT - MAX_BUTTON_HEIGHT) / 2 + USD_LABEL_HEIGHT}px`,
          }}
          step="any"
        />
        <div className="absolute right-0 top-0 z-[2] flex h-20 flex-col items-end justify-center pl-3 pr-4">
          <TBody className="text-right text-2xl">{reserve.symbol}</TBody>
          <TLabel
            className="text-right"
            style={{ height: `${USD_LABEL_HEIGHT}px` }}
          >
            ≈{formatUsd(new BigNumber(value || "0").times(reserve.price))}
          </TLabel>
        </div>
      </div>
    );
  },
);
ActionsModalInput.displayName = "ActionsModalInput";

export default ActionsModalInput;
