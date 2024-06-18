import { useState } from "react";

import BigNumber from "bignumber.js";
import { Settings2 } from "lucide-react";

import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Popover from "@/components/shared/Popover";
import { formatPercent } from "@/lib/format";

interface SwapSlippagePopoverProps {
  slippage: string;
  onSlippageChange: (value: string) => void;
}

export default function SwapSlippagePopover({
  slippage,
  onSlippageChange,
}: SwapSlippagePopoverProps) {
  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover
      id="swap-slippage"
      rootProps={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className="h-7"
          labelClassName="uppercase text-xs"
          startIcon={<Settings2 />}
          variant="secondary"
          size="sm"
          role="combobox"
        >
          {formatPercent(new BigNumber(slippage || 0), { dp: 1 })} slippage
        </Button>
      }
      contentProps={{
        align: "end",
        sideOffset: 2,
        className: "border-0 w-[var(--radix-popover-trigger-width)] p-0",
      }}
    >
      <Input
        id="slippage"
        type="number"
        value={slippage}
        onChange={onSlippageChange}
        inputProps={{
          autoFocus: false,
          className: "h-8 focus:border-secondary rounded-sm",
          min: 0,
          max: 5,
          step: 0.1,
        }}
        endDecorator="%"
      />
    </Popover>
  );
}
