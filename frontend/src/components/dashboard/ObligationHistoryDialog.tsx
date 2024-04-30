import { CSSProperties, useCallback, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import axios from "axios";
import BigNumber from "bignumber.js";
import { formatDate } from "date-fns";
import { FileClock, RefreshCcw } from "lucide-react";
import pLimit from "p-limit";

import { WAD } from "@suilend/sdk/constants";

import DataTable, { tableHeader } from "@/components/dashboard/DataTable";
import Button from "@/components/shared/Button";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import TokenIcon from "@/components/shared/TokenIcon";
import { TBody, TLabelSans, TTitle } from "@/components/shared/Typography";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppData, useAppContext } from "@/contexts/AppContext";
import {
  BorrowEvent,
  ClaimRewardEvent,
  DepositEvent,
  EventType,
  EventTypeNameMap,
  LiquidateEvent,
  RepayEvent,
  ReserveAssetDataEvent,
  WithdrawEvent,
  eventSortAsc,
  eventSortDesc,
  getDedupedClaimRewardEvents,
} from "@/lib/events";
import { formatToken } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  reserveAssetData: ReserveAssetDataEvent[];

  deposit: DepositEvent[];
  borrow: BorrowEvent[];
  withdraw: WithdrawEvent[];
  repay: RepayEvent[];
  liquidate: LiquidateEvent[];
  claimReward: ClaimRewardEvent[];
};

interface RowData {
  date: Date;
  type: EventType;
  event:
    | DepositEvent
    | BorrowEvent
    | WithdrawEvent
    | RepayEvent
    | LiquidateEvent
    | ClaimRewardEvent;
}

export default function ObligationHistoryDialog() {
  const { explorer, obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // Columns
  const columns: ColumnDef<RowData>[] = [
    {
      id: "date",
      accessorKey: "date",
      sortingFn: (rowA: Row<RowData>, rowB: Row<RowData>) =>
        eventSortAsc(rowA.original.event, rowB.original.event),
      header: ({ column }) =>
        tableHeader(column, "Date", { isDate: true, borderBottom: true }),
      cell: ({ row }) => {
        const { date } = row.original;

        return (
          <TBody className="w-max">
            {formatDate(date, "yyyy-MM-dd HH:mm:ss")}
          </TBody>
        );
      },
    },
    {
      id: "type",
      accessorKey: "type",
      enableSorting: false,
      header: ({ column }) =>
        tableHeader(column, "Action", { borderBottom: true }),
      cell: ({ row }) => {
        const { type } = row.original;

        return (
          <TBody className="w-max uppercase">{EventTypeNameMap[type]}</TBody>
        );
      },
    },
    {
      id: "details",
      accessorKey: "details",
      enableSorting: false,
      header: ({ column }) =>
        tableHeader(column, "Details", { borderBottom: true }),
      cell: ({ row }) => {
        const { event, type } = row.original;

        if (type === EventType.DEPOSIT) {
          const depositEvent = event as DepositEvent;
          const coinMetadata = data.coinMetadataMap[depositEvent.coinType];

          let amount;

          const reserveAssetDataEvent = eventsData?.reserveAssetData.find(
            (e) => e.digest === depositEvent.digest,
          );
          if (reserveAssetDataEvent) {
            const ctokenExchangeRate = new BigNumber(
              new BigNumber(reserveAssetDataEvent.supplyAmount).div(
                WAD.toString(),
              ),
            ).div(reserveAssetDataEvent.ctokenSupply);

            amount = new BigNumber(depositEvent.ctokenAmount)
              .times(ctokenExchangeRate)
              .div(10 ** coinMetadata.decimals);
          }

          return (
            <TokenAmount
              amount={amount}
              coinType={depositEvent.coinType}
              symbol={coinMetadata.symbol}
              iconUrl={coinMetadata.iconUrl}
              decimals={coinMetadata.decimals}
            />
          );
        } else if (type === EventType.BORROW) {
          const borrowEvent = event as BorrowEvent;
          const coinMetadata = data.coinMetadataMap[borrowEvent.coinType];

          const amount = new BigNumber(borrowEvent.liquidityAmount).div(
            10 ** coinMetadata.decimals,
          );

          return (
            <TokenAmount
              amount={amount}
              coinType={borrowEvent.coinType}
              symbol={coinMetadata.symbol}
              iconUrl={coinMetadata.iconUrl}
              decimals={coinMetadata.decimals}
            />
          );
        } else if (type === EventType.WITHDRAW) {
          const withdrawEvent = event as WithdrawEvent;
          const coinMetadata = data.coinMetadataMap[withdrawEvent.coinType];

          let amount;

          const reserveAssetDataEvent = eventsData?.reserveAssetData.find(
            (e) => e.digest === withdrawEvent.digest,
          );
          if (reserveAssetDataEvent) {
            const ctokenExchangeRate = new BigNumber(
              new BigNumber(reserveAssetDataEvent.supplyAmount).div(
                WAD.toString(),
              ),
            ).div(reserveAssetDataEvent.ctokenSupply);

            amount = new BigNumber(withdrawEvent.ctokenAmount)
              .times(ctokenExchangeRate)
              .div(10 ** coinMetadata.decimals);
          }

          return (
            <TokenAmount
              amount={amount}
              coinType={withdrawEvent.coinType}
              symbol={coinMetadata.symbol}
              iconUrl={coinMetadata.iconUrl}
              decimals={coinMetadata.decimals}
            />
          );
        } else if (type === EventType.REPAY) {
          const repayEvent = event as RepayEvent;
          const coinMetadata = data.coinMetadataMap[repayEvent.coinType];

          const amount = new BigNumber(repayEvent.liquidityAmount).div(
            10 ** coinMetadata.decimals,
          );

          return (
            <TokenAmount
              amount={amount}
              coinType={repayEvent.coinType}
              symbol={coinMetadata.symbol}
              iconUrl={coinMetadata.iconUrl}
              decimals={coinMetadata.decimals}
            />
          );
        } else if (type === EventType.LIQUIDATE) {
          const liquidateEvent = event as LiquidateEvent;

          const reserveAssetDataEvent = eventsData?.reserveAssetData.find(
            (e) => e.digest === liquidateEvent.digest,
          );

          const repayReserve = data.lendingMarket.reserves.find(
            (reserve) => reserve.id === liquidateEvent.repayReserveId,
          );
          const withdrawReserve = data.lendingMarket.reserves.find(
            (reserve) => reserve.id === liquidateEvent.withdrawReserveId,
          );

          if (!reserveAssetDataEvent || !repayReserve || !withdrawReserve)
            return (
              <TLabelSans className="w-max">See txn for details</TLabelSans>
            );

          const ctokenExchangeRate = new BigNumber(
            new BigNumber(reserveAssetDataEvent.supplyAmount).div(
              WAD.toString(),
            ),
          ).div(reserveAssetDataEvent.ctokenSupply);

          const liquidatedAmount = new BigNumber(liquidateEvent.withdrawAmount)
            .times(ctokenExchangeRate)
            .div(10 ** withdrawReserve.mintDecimals);
          const repaidAmount = new BigNumber(liquidateEvent.repayAmount).div(
            10 ** repayReserve.mintDecimals,
          );

          return (
            <div className="flex w-max flex-col">
              <div className="flex w-max flex-row items-center gap-2">
                <TLabelSans>Deposits liquidated</TLabelSans>
                <TokenAmount
                  amount={liquidatedAmount}
                  coinType={withdrawReserve.coinType}
                  symbol={withdrawReserve.symbol}
                  iconUrl={withdrawReserve.iconUrl}
                  decimals={withdrawReserve.mintDecimals}
                />
              </div>
              <div className="flex w-max flex-row items-center gap-2">
                <TLabelSans>Borrows repaid</TLabelSans>
                <TokenAmount
                  amount={repaidAmount}
                  coinType={repayReserve.coinType}
                  symbol={repayReserve.symbol}
                  iconUrl={repayReserve.iconUrl}
                  decimals={repayReserve.mintDecimals}
                />
              </div>
            </div>
          );
        } else if (type === EventType.CLAIM_REWARD) {
          const claimRewardEvent = event as ClaimRewardEvent;
          const coinMetadata = data.coinMetadataMap[claimRewardEvent.coinType];

          return (
            <div className="flex w-max flex-row items-center gap-2">
              <TokenIcon
                className="h-4 w-4"
                coinType={claimRewardEvent.coinType}
                symbol={coinMetadata.symbol}
                url={coinMetadata.iconUrl}
              />

              <TBody className="uppercase">
                {formatToken(
                  new BigNumber(claimRewardEvent.liquidityAmount).div(
                    10 ** coinMetadata.decimals,
                  ),
                  { dp: coinMetadata.decimals },
                )}{" "}
                {coinMetadata.symbol}
              </TBody>
            </div>
          );
        }

        return <div>{event.eventIndex}</div>;
      },
    },
    {
      id: "digest",
      accessorKey: "digest",
      enableSorting: false,
      header: ({ column }) =>
        tableHeader(column, "Txn", { borderBottom: true }),
      cell: ({ row }) => {
        const { event } = row.original;

        return <OpenOnExplorerButton url={explorer.buildTxUrl(event.digest)} />;
      },
    },
  ];

  // Events
  const [eventsData, setEventsData] = useState<EventsData | undefined>(
    undefined,
  );

  const clearEventsData = useCallback(() => {
    setEventsData(undefined);
  }, []);

  const fetchEventsData = useCallback(async () => {
    if (!obligation) return;

    clearEventsData();
    try {
      const response = await axios.get("/api/events", {
        params: {
          eventTypes: [
            EventType.DEPOSIT,
            EventType.BORROW,
            EventType.WITHDRAW,
            EventType.REPAY,
            EventType.LIQUIDATE,
            EventType.CLAIM_REWARD,
          ].join(","),
          obligationId: obligation.id,
        },
      });

      // Parse
      const data = response.data as Omit<EventsData, "reserveAssetData">;
      for (const event of [
        ...data.deposit,
        ...data.borrow,
        ...data.withdraw,
        ...data.repay,
        ...data.claimReward,
      ]) {
        event.coinType = normalizeStructTag(event.coinType);
      }

      // Get reserve asset data events for deposit, withdraw, and liquidate events
      const digests = Array.from(
        new Set(
          [...data.deposit, ...data.withdraw, ...data.liquidate].map(
            (event) => event.digest,
          ),
        ),
      );

      const limit = pLimit(5);
      const promises = digests.map((digest) =>
        limit(() =>
          axios.get("/api/events", {
            params: {
              eventTypes: "reserveAssetData",
              digest,
            },
          }),
        ),
      );
      const reserveAssetDataEvents = (await Promise.all(promises))
        .map(
          (r) =>
            (r.data as Pick<EventsData, "reserveAssetData">).reserveAssetData ??
            [],
        )
        .flat();
      for (const event of reserveAssetDataEvents) {
        event.coinType = normalizeStructTag(event.coinType);
      }

      setEventsData({
        reserveAssetData: reserveAssetDataEvents.slice().sort(eventSortAsc),

        deposit: (data.deposit ?? []).slice().sort(eventSortDesc),
        borrow: (data.borrow ?? []).slice().sort(eventSortDesc),
        withdraw: (data.withdraw ?? []).slice().sort(eventSortDesc),
        repay: (data.repay ?? []).slice().sort(eventSortDesc),
        liquidate: (data.liquidate ?? []).slice().sort(eventSortDesc),
        claimReward: getDedupedClaimRewardEvents(
          (data.claimReward ?? []).slice().sort(eventSortDesc),
        ),
      });
    } catch (e) {
      console.error(e);
    }
  }, [obligation, clearEventsData]);

  // State
  const onOpenChange = (isOpen: boolean) => {
    if (isOpen && rows === undefined) fetchEventsData();
  };

  // Filters
  const initialFilters = [
    EventType.DEPOSIT,
    EventType.BORROW,
    EventType.WITHDRAW,
    EventType.REPAY,
    EventType.LIQUIDATE,
    EventType.CLAIM_REWARD,
  ];
  const [filters, setFilters] = useState<EventType[]>(initialFilters);

  const toggleFilter = (eventType: EventType) => {
    setFilters((arr) =>
      arr.includes(eventType)
        ? arr.filter((f) => f !== eventType)
        : [...arr, eventType],
    );
  };

  // Rows
  const rows =
    eventsData === undefined
      ? undefined
      : Object.entries(eventsData)
          .reduce((acc: RowData[], [key, value]) => {
            if ((key as EventType) === EventType.RESERVE_ASSET_DATA) return acc;

            return [
              ...acc,
              ...value.map((event) => ({
                date: new Date(event.timestamp * 1000),
                type: key as EventType,
                event,
              })),
            ] as RowData[];
          }, [])
          .sort((a: RowData, b: RowData) => eventSortDesc(a.event, b.event));

  const filteredRows =
    rows === undefined
      ? undefined
      : rows.filter((row) => filters.includes(row.type));

  if (!obligation) return null;
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild className="appearance-none">
        <Button
          className="text-muted-foreground"
          tooltip="View history"
          icon={<FileClock />}
          size="icon"
          variant="ghost"
        >
          View history
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex h-dvh max-h-none max-w-none flex-col gap-0 overflow-hidden bg-popover p-0 sm:h-[calc(100dvh-var(--sm-my)*2)] sm:w-[calc(100dvw-var(--sm-mx)*2)] sm:max-w-4xl"
        style={{ "--sm-mx": "2rem", "--sm-my": "2rem" } as CSSProperties}
        onOpenAutoFocus={(e) => e.preventDefault()}
        overlay={{ className: "bg-background/80" }}
      >
        <DialogHeader className="relative h-max space-y-0 border-b p-4">
          <TTitle className="flex flex-row items-center gap-2 uppercase">
            <FileClock className="h-4 w-4 shrink-0" />
            Account history
          </TTitle>

          <Button
            className="absolute right-[calc(8px+20px+16px)] top-1/2 -translate-y-2/4 text-muted-foreground"
            tooltip="Refresh"
            icon={<RefreshCcw />}
            variant="ghost"
            size="icon"
            onClick={fetchEventsData}
          >
            Refresh
          </Button>
        </DialogHeader>

        <div className="flex flex-row flex-wrap gap-2 p-4">
          {initialFilters.map((eventType) => (
            <Button
              key={eventType}
              labelClassName="text-xs font-sans"
              className={cn(
                "rounded-full",
                filters.includes(eventType) &&
                  "border-secondary bg-secondary/5 text-primary-foreground",
              )}
              variant="secondaryOutline"
              size="sm"
              onClick={() => toggleFilter(eventType)}
            >
              {EventTypeNameMap[eventType]}
            </Button>
          ))}
        </div>

        <DataTable<RowData>
          columns={columns}
          data={filteredRows}
          noDataMessage={
            filters.length === initialFilters.length
              ? "No history"
              : "No history for the active filters"
          }
          skeletonRows={20}
          container={{
            className: cn(filteredRows === undefined && "overflow-y-hidden"),
          }}
          tableClassName="border-y-0 relative"
          tableHeaderRowClassName="border-none"
          tableHeadClassName={(header) =>
            cn(
              "sticky bg-popover top-0 z-[2]",
              header.id === "digest" ? "w-16" : "w-auto",
            )
          }
          tableCellClassName={(cell) =>
            cn(
              "z-[1]",
              cell?.row.original.type === EventType.LIQUIDATE
                ? "py-2 h-auto"
                : "py-0 h-12",
            )
          }
        />
      </DialogContent>
    </Dialog>
  );
}
