import { useState } from "react";

import { Info } from "lucide-react";

import Button from "@/components/shared/Button";
import Popover from "@/components/shared/Popover";
import { TBody, TLabelSans, TTitle } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { getFormattedMaxOutflow } from "@/lib/rateLimiter";
import { cn } from "@/lib/utils";

export default function MarketOverviewPopover() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  const formatedOutflow = getFormattedMaxOutflow(
    data.lendingMarket.rateLimiter,
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover
      id="market-overview"
      rootProps={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className={cn("text-muted-foreground", isOpen && "text-foreground")}
          icon={<Info />}
          variant="ghost"
          size="icon"
          role="combobox"
        >
          Info
        </Button>
      }
      contentProps={{
        align: "end",
        className: "w-[300px]",
      }}
    >
      <TTitle className="mb-3 flex flex-row items-center gap-2 uppercase">
        <Info className="h-3 w-3" />
        About this pool
      </TTitle>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-4">
          <TLabelSans>Max outflow</TLabelSans>
          <TBody className="break-words text-right uppercase">
            {formatedOutflow.formattedMaxOutflow}
          </TBody>
        </div>

        <div className="flex flex-row items-center justify-between gap-4">
          <TLabelSans>Owner</TLabelSans>
          <TBody className="text-right uppercase">Suilend</TBody>
        </div>
      </div>
    </Popover>
  );
}
