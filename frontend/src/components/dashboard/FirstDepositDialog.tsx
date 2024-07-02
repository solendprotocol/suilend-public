import { useCallback, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import { PartyPopper } from "lucide-react";

import { ApiDepositEvent } from "@suilend/sdk/types";

import Dialog from "@/components/dashboard/Dialog";
import { TLabelSans } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { EventType, eventSortAsc } from "@/lib/events";
import { API_URL } from "@/lib/navigation";

export type EventsData = {
  deposit: ApiDepositEvent[];
};

export default function FirstDepositDialog() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  // State
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const onOpenChange = (_isOpen: boolean) => {
    setIsOpen(_isOpen);
  };

  // Events
  const [eventsData, setEventsData] = useState<EventsData | undefined>(
    undefined,
  );

  const clearEventsData = useCallback(() => {
    setEventsData(undefined);
  }, []);

  const fetchEventsData = useCallback(
    async (obligationId: string) => {
      clearEventsData();

      try {
        const url = `${API_URL}/events?${new URLSearchParams({
          eventTypes: [EventType.DEPOSIT].join(","),
          obligationId,
        })}`;
        const res = await fetch(url);
        const json = await res.json();

        // Parse
        const data = { ...json } as EventsData;
        for (const event of [...(data.deposit ?? [])]) {
          event.coinType = normalizeStructTag(event.coinType);
        }

        setEventsData({
          deposit: (data.deposit ?? []).slice().sort(eventSortAsc),
        });
      } catch (err) {
        console.error(err);
      }
    },
    [clearEventsData],
  );

  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      dialogContentProps={{ className: "max-w-md border-success/50" }}
      drawerContentProps={{ className: "border-success/50" }}
      headerProps={{
        className: "pb-0",
        titleClassName: "text-success",
        titleIcon: <PartyPopper />,
        title: "Congrats on your first deposit",
      }}
      isAutoHeight
    >
      <div className="flex flex-col gap-4 p-4">
        <TLabelSans className="text-foreground">
          {
            "Your Suilend account is represented as an NFT, so you can see an overview of your position right from your wallet's NFT section."
          }
        </TLabelSans>

        <div className="h-[200px] w-full bg-muted/10" />

        <TLabelSans className="text-foreground">
          Remember, do not burn this NFT!
        </TLabelSans>
      </div>
    </Dialog>
  );
}
