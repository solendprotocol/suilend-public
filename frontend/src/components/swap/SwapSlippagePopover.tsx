import { useState } from "react";

import BigNumber from "bignumber.js";
import { Settings2 } from "lucide-react";

import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Popover from "@/components/shared/Popover";
import { TLabel } from "@/components/shared/Typography";
import styles from "@/components/swap/SwapSlippagePopover.module.scss";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

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
          className={cn("h-7 rounded-full", isOpen && "!bg-secondary")}
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
        className: "w-[160px] py-0 px-2",
      }}
    >
      <div className="flex h-8 flex-row items-center gap-2">
        <TLabel>0%</TLabel>
        <div className="flex-1">
          <Input
            id="slippage"
            type="range"
            value={slippage}
            onChange={onSlippageChange}
            inputProps={{
              autoFocus: false,
              className: cn(styles.input, "p-0 h-4 border-0"),
              min: 0,
              max: 5,
              step: 0.1,
            }}
          />
        </div>
        <TLabel>5%</TLabel>
      </div>
    </Popover>
  );
}
