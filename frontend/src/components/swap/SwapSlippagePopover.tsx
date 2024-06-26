import { useState } from "react";

import BigNumber from "bignumber.js";
import { Settings2 } from "lucide-react";

import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Popover from "@/components/shared/Popover";
import TitleWithIcon from "@/components/shared/TitleWithIcon";
import { TLabelSans } from "@/components/shared/Typography";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const PRESETS = ["0.3", "0.5", "1.0"];

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

  const onPresetClick = (value: string) => {
    onSlippageChange(value);
    setIsOpen(false);
  };

  return (
    <Popover
      id="swap-slippage"
      rootProps={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className={cn("h-7 rounded-full bg-border", isOpen && "!bg-border")}
          labelClassName="uppercase text-xs"
          startIcon={<Settings2 />}
          variant="ghost"
          size="sm"
          role="combobox"
        >
          {formatPercent(new BigNumber(slippage || 0), { dp: 1 })}
        </Button>
      }
      contentProps={{
        align: "end",
        className: "w-[360px] p-4",
      }}
    >
      <div className="flex flex-col gap-4">
        <TitleWithIcon>Slippage</TitleWithIcon>

        <div className="flex w-full flex-row flex-wrap justify-between gap-x-4 gap-y-2">
          <div className="flex flex-row gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset}
                className={cn(
                  "w-12 rounded-full px-0",
                  slippage === preset &&
                    "border-secondary bg-secondary/5 text-primary-foreground",
                )}
                labelClassName="text-xs"
                variant="secondaryOutline"
                size="sm"
                onClick={() => onPresetClick(preset)}
              >
                {formatPercent(new BigNumber(preset), { dp: 1 })}
              </Button>
            ))}
          </div>

          <div className="flex flex-row items-center gap-2">
            <TLabelSans>Custom</TLabelSans>

            <div className="flex flex-row items-center gap-1">
              <Input
                id="custom-slippage"
                type="number"
                defaultValue={PRESETS.includes(slippage) ? "" : slippage}
                onChange={onSlippageChange}
                inputProps={{
                  className:
                    "text-xs w-12 px-0 bg-card rounded-full h-6 py-0 text-center focus:border-secondary",
                  min: 0,
                  max: 100,
                }}
              />
              <TLabelSans>%</TLabelSans>
            </div>
          </div>
        </div>
      </div>
    </Popover>
  );
}
