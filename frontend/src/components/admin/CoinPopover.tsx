import { useState } from "react";

import { ChevronsUpDown } from "lucide-react";

import Button from "@/components/shared/Button";
import Popover from "@/components/shared/Popover";
import TokenLogo from "@/components/shared/TokenLogo";
import { TLabel, TLabelSans } from "@/components/shared/Typography";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { ParsedCoinBalance } from "@/lib/coinBalance";
import { formatToken } from "@/lib/format";

interface CoinPopoverProps {
  coinBalancesMap: Record<string, ParsedCoinBalance>;
  index: number | null;
  onIndexChange: (index: number) => void;
}

export default function CoinPopover({
  coinBalancesMap,
  index,
  onIndexChange,
}: CoinPopoverProps) {
  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onSelect = async (index: number) => {
    onIndexChange(index);
    setIsOpen(false);
  };

  return (
    <Popover
      label="coin"
      id="coin"
      rootProps={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className="justify-between"
          labelClassName="uppercase"
          endIcon={<ChevronsUpDown />}
          variant="secondary"
          size="lg"
          role="combobox"
        >
          {index !== null
            ? Object.values(coinBalancesMap)[index].symbol
            : "Select coin"}
        </Button>
      }
      contentProps={{
        align: "start",
        className: "p-0",
        style: {
          width: "var(--radix-popover-trigger-width)",
        },
      }}
    >
      <Command>
        <CommandGroup>
          {Object.values(coinBalancesMap).map((cb, index) => (
            <CommandItem
              key={cb.coinType}
              value={cb.coinType}
              onSelect={() => onSelect(index)}
              className="flex cursor-pointer flex-row items-center text-foreground aria-selected:text-foreground"
            >
              <div className="mr-2">
                <TokenLogo
                  className="h-4 w-4"
                  token={{
                    coinType: cb.coinType,
                    symbol: cb.symbol,
                    iconUrl: cb.iconUrl,
                  }}
                />
              </div>

              <div className="flex w-full flex-row items-center justify-between">
                <TLabel>{cb.symbol}</TLabel>
                <TLabelSans>
                  {formatToken(cb.balance, { dp: cb.mintDecimals })} {cb.symbol}
                </TLabelSans>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </Popover>
  );
}
