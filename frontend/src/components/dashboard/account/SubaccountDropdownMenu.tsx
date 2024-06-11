import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import UtilizationBar from "@/components/dashboard/UtilizationBar";
import Button from "@/components/shared/Button";
import CopyToClipboardButton from "@/components/shared/CopyToClipboardButton";
import DropdownMenu, {
  DropdownMenuItem,
} from "@/components/shared/DropdownMenu";
import Tooltip from "@/components/shared/Tooltip";
import { TLabel, TLabelSans } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { formatId, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SubaccountDropdownMenu() {
  const { setObligationId, ...restAppContext } = useAppContext();
  const obligation = restAppContext.obligation as ParsedObligation;
  const data = restAppContext.data as AppData;
  const obligations = data.obligations as ParsedObligation[];

  const getTitle = (id: string, isShort?: boolean) =>
    [
      isShort ? "Subacc." : "Subaccount",
      obligations.findIndex((o) => o.id === id) + 1,
    ].join(" ");

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const Icon = isOpen ? ChevronUp : ChevronDown;

  return (
    <DropdownMenu
      root={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className={cn(
            isOpen && "border-secondary bg-secondary/5 text-primary-foreground",
          )}
          labelClassName="text-xs font-sans"
          endIcon={<Icon />}
          variant="secondaryOutline"
        >
          {getTitle(obligation.id, true)}
        </Button>
      }
      title={getTitle(obligation.id)}
      description={
        <div className="flex flex-col gap-1">
          <div className="flex h-4 flex-row items-center gap-1">
            <Tooltip title={obligation.id}>
              <TLabel className="uppercase">
                {formatId(obligation.id, 12)}
              </TLabel>
            </Tooltip>
            <CopyToClipboardButton
              tooltip="Copy id to clipboard"
              value={obligation.id}
            />
          </div>

          <UtilizationBar
            className="mt-2 h-1"
            obligation={obligation}
            noTooltip
          />
        </div>
      }
      items={
        <>
          <TLabelSans className="mt-2">Switch to</TLabelSans>
          {obligations
            .filter((o) => o.id !== obligation.id)
            .map((o) => (
              <DropdownMenuItem
                key={o.id}
                className="flex flex-col items-start gap-1"
                onClick={() => setObligationId(o.id)}
              >
                <div className="flex w-full justify-between">
                  <TLabelSans className="text-inherit">
                    {getTitle(o.id)}
                  </TLabelSans>
                  <TLabelSans className="text-inherit">
                    {o.positionCount} position{o.positionCount > 1 ? "s" : ""}
                  </TLabelSans>
                </div>

                <div className="flex w-full justify-between">
                  <TLabelSans className="text-right text-inherit">
                    {formatUsd(o.depositedAmountUsd)} deposited
                  </TLabelSans>
                  <TLabelSans className="text-right text-inherit">
                    {formatUsd(o.borrowedAmountUsd)} borrowed
                  </TLabelSans>
                </div>

                <UtilizationBar className="mt-2 h-1" obligation={o} noTooltip />
              </DropdownMenuItem>
            ))}
        </>
      }
    />
  );
}
