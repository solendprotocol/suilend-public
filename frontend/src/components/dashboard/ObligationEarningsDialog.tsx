import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";
import { HandCoins } from "lucide-react";
import { RefreshCcw } from "lucide-react";

import Dialog from "@/components/dashboard/Dialog";
import ObligationSwitcherPopover from "@/components/dashboard/ObligationSwitcherPopover";
import Button from "@/components/shared/Button";
import TokenIcon from "@/components/shared/TokenIcon";
import { TBody } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import {
  BorrowEvent,
  ClaimRewardEvent,
  DepositEvent,
  EventType,
  InterestUpdateEvent,
  LiquidateEvent,
  RepayEvent,
  WithdrawEvent,
  eventSortDesc,
} from "@/lib/events";
import { formatToken } from "@/lib/format";
import { API_URL } from "@/lib/navigation";

interface TokenAmountProps {
  amount?: BigNumber;
  coinType: string;
  symbol: string;
  iconUrl?: string | null;
  decimals: number;
}

function TokenAmount({
  amount,
  coinType,
  symbol,
  iconUrl,
  decimals,
}: TokenAmountProps) {
  return (
    <div className="flex w-max flex-row items-center gap-2">
      <TokenIcon
        className="h-4 w-4"
        coinType={coinType}
        symbol={symbol}
        url={iconUrl}
      />

      <TBody className="uppercase">
        {amount === undefined ? "N/A" : formatToken(amount, { dp: decimals })}{" "}
        {symbol}
      </TBody>
    </div>
  );
}

type EventsData = {
  interestUpdate: InterestUpdateEvent[];
};

interface RowData {
  timestamp: number;
  eventIndex: number;
  type: EventType;
  event:
    | DepositEvent
    | BorrowEvent
    | WithdrawEvent
    | RepayEvent
    | LiquidateEvent
    | ClaimRewardEvent;
  subRows?: RowData[];
}

export default function ObligationEarningsDialog() {
  const router = useRouter();
  const { explorer, obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // Columns

  // Events
  const [eventsData, setEventsData] = useState<EventsData | undefined>(
    undefined,
  );

  const clearEventsData = useCallback(() => {
    setEventsData(undefined);
  }, []);

  const fetchEventsData = useCallback(
    async (_obligationId?: string) => {
      const obligationId = _obligationId ?? obligation?.id;
      if (!obligationId) return;

      clearEventsData();

      try {
        const url = `${API_URL}/events?${new URLSearchParams({
          eventTypes: [EventType.INTEREST_UPDATE].join(","),
          obligationId,
        })}`;
        const res = await fetch(url);
        const json = await res.json();
        console.log("XXX", json);

        // Parse
        const data = json as EventsData;
        for (const event of data.interestUpdate) {
          event.coinType = normalizeStructTag(event.coinType);
        }

        setEventsData({
          interestUpdate: (data.interestUpdate ?? [])
            .slice()
            .sort(eventSortDesc),
        });
      } catch (e) {
        console.error(e);
      }
    },
    [obligation?.id, clearEventsData],
  );

  // Rows
  console.log("XXX", eventsData);

  // State
  const isOpen = router.query.showEarnings !== undefined;

  const isFetchingRef = useRef<boolean>(false);
  useEffect(() => {
    if (isOpen) {
      if (isFetchingRef.current) return;

      fetchEventsData();
      isFetchingRef.current = true;
    } else {
      clearEventsData();
      isFetchingRef.current = false;
    }
  }, [isOpen, fetchEventsData, clearEventsData]);
  const onOpenChange = (_isOpen: boolean) => {
    const { showEarnings, ...restQuery } = router.query;

    router.push({
      query: _isOpen ? { ...restQuery, showEarnings: true } : restQuery,
    });
  };

  if (!obligation) return null;
  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      trigger={
        <Button
          className="text-muted-foreground"
          tooltip="View earnings"
          icon={<HandCoins />}
          size="icon"
          variant="ghost"
        >
          View earnings
        </Button>
      }
      titleIcon={<HandCoins />}
      title="Account earnings"
      headerEndContent={
        <>
          {data.obligations && data.obligations.length > 1 && (
            <ObligationSwitcherPopover onSelect={fetchEventsData} />
          )}

          <Button
            className="text-muted-foreground"
            tooltip="Refresh"
            icon={<RefreshCcw />}
            variant="ghost"
            size="icon"
            onClick={() => fetchEventsData()}
          >
            Refresh
          </Button>
        </>
      }
    >
      hi
    </Dialog>
  );
}
