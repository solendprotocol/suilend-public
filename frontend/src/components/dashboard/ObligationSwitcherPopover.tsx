import { useState } from "react";

import { ChevronsUpDown, User } from "lucide-react";

import Button from "@/components/shared/Button";
import Popover from "@/components/shared/Popover";
import { TLabel, TLabelSans } from "@/components/shared/Typography";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ObligationSwitcherPopover() {
  const { obligation, setObligationId, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onSelect = async (id: string) => {
    setObligationId(id);
    setIsOpen(false);
  };

  if (!data.obligations || !obligation) return null;

  return (
    <Popover
      id="obligation"
      rootProps={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className={cn(
            "uppercase",
            isOpen && "border-secondary bg-secondary/5 text-primary-foreground",
          )}
          labelClassName="text-xs"
          startIcon={<User />}
          endIcon={<ChevronsUpDown />}
          variant="secondaryOutline"
          role="combobox"
        >
          Subaccount{" "}
          {data.obligations.findIndex((o) => o.id === obligation.id) + 1}
        </Button>
      }
      contentProps={{
        align: "end",
        className: "p-0 w-[300px]",
      }}
    >
      <Command>
        <CommandGroup>
          {data.obligations.map((o, index) => (
            <CommandItem
              key={o.id}
              value={o.id}
              onSelect={() => onSelect(o.id)}
              className="flex cursor-pointer flex-col items-center gap-1 text-foreground aria-selected:text-foreground"
            >
              <div className="flex w-full justify-between">
                <TLabel className="text-inherit">Subaccount {index + 1}</TLabel>
                <TLabel className="text-inherit">
                  {o.positionCount} position{o.positionCount > 1 ? "s" : ""}
                </TLabel>
              </div>

              <div className="flex w-full justify-between">
                <TLabelSans className="text-right">
                  {formatUsd(o.depositedAmountUsd)} deposited
                </TLabelSans>
                <TLabelSans className="text-right">
                  {formatUsd(o.borrowedAmountUsd)} borrowed
                </TLabelSans>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </Popover>
  );
}
