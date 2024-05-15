import { useEffect, useMemo, useRef, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";

import { WAD } from "@suilend/sdk/constants";

import Card from "@/components/dashboard/Card";
import MarketOverviewPopover from "@/components/dashboard/MarketOverviewPopover";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabel, TLabelSans } from "@/components/shared/Typography";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { ReserveAssetDataEvent } from "@/lib/events";
import { formatPercent, formatUsd } from "@/lib/format";
import { API_URL } from "@/lib/navigation";
import { cn, hoverUnderlineClassName } from "@/lib/utils";

interface PercentChangeLabelProps {
  tooltip: string;
  changePercent?: BigNumber;
}

function PercentChangeLabel({
  tooltip,
  changePercent,
}: PercentChangeLabelProps) {
  return changePercent === undefined ? (
    <Skeleton className="h-4 w-10" />
  ) : (
    <Tooltip title={tooltip}>
      <TLabel
        className={cn(
          "w-max",
          changePercent.gt(0) && "text-success decoration-success/50",
          changePercent.lt(0) && "text-destructive decoration-destructive/50",
          hoverUnderlineClassName,
        )}
      >
        {changePercent.gt(0) && "+"}
        {formatPercent(changePercent)}
      </TLabel>
    </Tooltip>
  );
}

export default function MarketOverview() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  // Events
  type DownsampledReserveAssetDataEvent = ReserveAssetDataEvent & {
    sampletimestamp: number;
  };

  const [
    downsampledReserveAssetDataEvents,
    setDownsampledReserveAssetDataEvents,
  ] = useState<DownsampledReserveAssetDataEvent[][] | undefined>(undefined);

  const reserveIds = useMemo(
    () => data.lendingMarket.reserves.map((r) => r.id),
    [data.lendingMarket.reserves],
  );

  const isFetchingEventsRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingEventsRef.current) return;

      isFetchingEventsRef.current = true;
      try {
        const urls = reserveIds.map(
          (reserveId) =>
            `${API_URL}/events/downsampled-reserve-asset-data?reserveId=${reserveId}&days=7`,
        );
        const res = await Promise.all(urls.map((url) => fetch(url)));
        const json = await Promise.all(res.map((res) => res.json()));

        setDownsampledReserveAssetDataEvents(json);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [reserveIds]);

  const lendingMarketStatsOneWeekAgo = useMemo(() => {
    if (downsampledReserveAssetDataEvents === undefined) return undefined;

    let totalDepositedAmountUsd = new BigNumber(0);
    let totalBorrowedAmountUsd = new BigNumber(0);
    let totalTvlUsd = new BigNumber(0);

    downsampledReserveAssetDataEvents.forEach((events) => {
      const event = events[0];
      const coinMetadata =
        data.coinMetadataMap[normalizeStructTag(event.coinType)];
      if (!event || !coinMetadata) return;

      const availableAmountUsd = new BigNumber(event.availableAmount)
        .div(WAD.toString())
        .div(10 ** coinMetadata.decimals)
        .times(event.price)
        .div(WAD.toString());
      const borrowedAmountUsd = new BigNumber(event.borrowedAmount)
        .div(WAD.toString())
        .div(10 ** coinMetadata.decimals)
        .times(event.price)
        .div(WAD.toString());
      const depositedAmountUsd = borrowedAmountUsd.plus(availableAmountUsd);

      totalDepositedAmountUsd =
        totalDepositedAmountUsd.plus(depositedAmountUsd);
      totalBorrowedAmountUsd = totalBorrowedAmountUsd.plus(borrowedAmountUsd);
      totalTvlUsd = totalTvlUsd.plus(availableAmountUsd);
    });

    return {
      depositedAmountUsd: totalDepositedAmountUsd,
      borrowedAmountUsd: totalBorrowedAmountUsd,
      tvlUsd: totalTvlUsd,
    };
  }, [downsampledReserveAssetDataEvents, data.coinMetadataMap]);

  const oneWeekChangePercent =
    lendingMarketStatsOneWeekAgo === undefined
      ? undefined
      : {
          depositedAmountUsd: new BigNumber(
            data.lendingMarket.depositedAmountUsd.minus(
              lendingMarketStatsOneWeekAgo.depositedAmountUsd,
            ),
          )
            .div(lendingMarketStatsOneWeekAgo.depositedAmountUsd)
            .times(100),
          borrowedAmountUsd: new BigNumber(
            data.lendingMarket.borrowedAmountUsd.minus(
              lendingMarketStatsOneWeekAgo.borrowedAmountUsd,
            ),
          )
            .div(lendingMarketStatsOneWeekAgo.borrowedAmountUsd)
            .times(100),
          tvlUsd: new BigNumber(
            data.lendingMarket.tvlUsd.minus(
              lendingMarketStatsOneWeekAgo.tvlUsd,
            ),
          )
            .div(lendingMarketStatsOneWeekAgo.tvlUsd)
            .times(100),
        };

  return (
    <Card
      header={{ title: "Pool overview", endContent: <MarketOverviewPopover /> }}
    >
      <CardContent className="flex flex-row justify-between gap-4">
        <div className="flex flex-col gap-1">
          <TLabelSans>Total deposits</TLabelSans>

          <div className="flex flex-col items-start">
            <TBody>{formatUsd(data.lendingMarket.depositedAmountUsd)}</TBody>
            <PercentChangeLabel
              tooltip="7d change in total deposits"
              changePercent={oneWeekChangePercent?.depositedAmountUsd}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <TLabelSans className="text-center">Total borrows</TLabelSans>

          <div className="flex flex-col items-center">
            <TBody>{formatUsd(data.lendingMarket.borrowedAmountUsd)}</TBody>
            <PercentChangeLabel
              tooltip="7d change in total borrows"
              changePercent={oneWeekChangePercent?.borrowedAmountUsd}
            />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <TLabelSans className="text-right">TVL</TLabelSans>

          <div className="flex flex-col items-end">
            <TBody>{formatUsd(data.lendingMarket.tvlUsd)}</TBody>
            <PercentChangeLabel
              tooltip="7d change in TVL"
              changePercent={oneWeekChangePercent?.tvlUsd}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
