import { useEffect, useState } from "react";

import Card from "@/components/dashboard/Card";
import MarketOverviewPopover from "@/components/dashboard/MarketOverviewPopover";
import { TBody, TLabel } from "@/components/shared/Typography";
import { CardContent } from "@/components/ui/card";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { EventType, ReserveAssetDataEvent } from "@/lib/events";
import { formatUsd } from "@/lib/format";
import { API_URL } from "@/lib/navigation";

export default function MarketOverview() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  const [reserveAssetDataEvents, setReserveAssetDataEvents] = useState<
    ReserveAssetDataEvent[] | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      const url = `${API_URL}/events?${new URLSearchParams({
        eventTypes: [EventType.DEPOSIT, EventType.BORROW].join(","),
      })}`;
      const res = await fetch(url);
      const json = await res.json();
      console.log("XXX", json);
    })();
  }, []);

  return (
    <Card
      id="market-overview"
      title="Pool overview"
      headerEndContent={<MarketOverviewPopover />}
      alwaysExpanded
    >
      <CardContent className="flex flex-row gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <TLabel className="uppercase">Total deposits</TLabel>
          <TBody>{formatUsd(data.lendingMarket.depositedAmountUsd)}</TBody>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <TLabel className="text-center uppercase">Total borrows</TLabel>
          <TBody className="text-center">
            {formatUsd(data.lendingMarket.borrowedAmountUsd)}
          </TBody>
        </div>

        <div className="flex flex-1 flex-col items-end gap-1">
          <TLabel className="text-right uppercase">TVL</TLabel>
          <TBody className="text-right">
            {formatUsd(data.lendingMarket.tvlUsd)}
          </TBody>
        </div>
      </CardContent>
    </Card>
  );
}
