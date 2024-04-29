import { CSSProperties, useCallback, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import BigNumber from "bignumber.js";
import { formatDate } from "date-fns";
import { FileClock, RefreshCcw } from "lucide-react";

import DataTable, { tableHeader } from "@/components/dashboard/DataTable";
import Button from "@/components/shared/Button";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import TokenIcon from "@/components/shared/TokenIcon";
import { TBody, TTitle } from "@/components/shared/Typography";
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
  RepayEvent,
  WithdrawEvent,
  eventSortFunction,
  getDedupedClaimRewardEvents,
} from "@/lib/events";
import { formatInteger, formatToken } from "@/lib/format";
import { cn } from "@/lib/utils";

enum EventType {
  DEPOSIT = "deposit",
  BORROW = "borrow",
  WITHDRAW = "withdraw",
  REPAY = "repay",
  CLAIM_REWARD = "claimReward",
}

type ReserveAssetDataEvent = {
  id: number;
  lendingMarket: string;
  coinType: string;
  reserveId: string;
  availableAmount: string;
  supplyAmount: string;
  borrowedAmount: string;
  availableAmountUsdEstimate: string;
  supplyAmountUsdEstimate: string;
  borrowedAmountUsdEstimate: string;
  borrowApr: string;
  supplyApr: string;
  ctokenSupply: string;
  cumulativeBorrowRate: string;
  price: string;
  smoothedPrice: string;
  priceLastUpdateTimestampS: number;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

interface RowData {
  date: Date;
  type: EventType;
  event:
    | DepositEvent
    | BorrowEvent
    | WithdrawEvent
    | RepayEvent
    | ClaimRewardEvent;
}

const ALL_EVENT_TYPES = Object.values(EventType);

const EventTypeNameMap: Record<EventType, string> = {
  [EventType.DEPOSIT]: "Deposit",
  [EventType.BORROW]: "Borrow",
  [EventType.WITHDRAW]: "Withdraw",
  [EventType.REPAY]: "Repay",
  [EventType.CLAIM_REWARD]: "Claim rewards",
};

export default function ObligationHistoryDialog() {
  const { explorer, obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // Columns
  const columns: ColumnDef<RowData>[] = [
    {
      id: "date",
      accessorKey: "date",
      sortingFn: "datetime",
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

        const coinMetadata = data.coinMetadataMap[event.coinType];

        if (type === EventType.DEPOSIT) {
          const depositEvent = event as DepositEvent;

          return (
            <div className="flex w-max flex-row items-center gap-2">
              <TokenIcon
                className="h-4 w-4"
                coinType={event.coinType}
                symbol={coinMetadata.symbol}
                url={coinMetadata.iconUrl}
              />

              <TBody className="uppercase">
                {formatInteger(parseInt(depositEvent.ctokenAmount))}{" "}
                {coinMetadata.symbol}
              </TBody>
            </div>
          );
        } else if (type === EventType.BORROW) {
          const borrowEvent = event as BorrowEvent;

          return (
            <div className="flex flex-row items-center gap-2">
              <TokenIcon
                className="h-4 w-4"
                coinType={event.coinType}
                symbol={coinMetadata.symbol}
                url={coinMetadata.iconUrl}
              />

              <TBody className="uppercase">
                {formatToken(
                  new BigNumber(borrowEvent.liquidityAmount).div(
                    10 ** coinMetadata.decimals,
                  ),
                  { dp: coinMetadata.decimals },
                )}{" "}
                {coinMetadata.symbol}
              </TBody>
            </div>
          );
        } else if (type === EventType.WITHDRAW) {
          const withdrawEvent = event as WithdrawEvent;

          return (
            <div className="flex w-max flex-row items-center gap-2">
              <TokenIcon
                className="h-4 w-4"
                coinType={event.coinType}
                symbol={coinMetadata.symbol}
                url={coinMetadata.iconUrl}
              />

              <TBody className="uppercase">
                {formatInteger(parseInt(withdrawEvent.ctokenAmount))}{" "}
                {coinMetadata.symbol}
              </TBody>
            </div>
          );
        } else if (type === EventType.REPAY) {
          const repayEvent = event as RepayEvent;

          return (
            <div className="flex flex-row items-center gap-2">
              <TokenIcon
                className="h-4 w-4"
                coinType={event.coinType}
                symbol={coinMetadata.symbol}
                url={coinMetadata.iconUrl}
              />

              <TBody className="uppercase">
                {formatToken(
                  new BigNumber(repayEvent.liquidityAmount).div(
                    10 ** coinMetadata.decimals,
                  ),
                  { dp: coinMetadata.decimals },
                )}{" "}
                {coinMetadata.symbol}
              </TBody>
            </div>
          );
        } else if (type === EventType.CLAIM_REWARD) {
          const claimRewardEvent = event as ClaimRewardEvent;

          const coin = data.coinMetadataMap[claimRewardEvent.coinType];

          return (
            <div className="flex w-max flex-row items-center gap-2">
              <TokenIcon
                className="h-4 w-4"
                coinType={claimRewardEvent.coinType}
                symbol={coin.symbol}
                url={coin.iconUrl}
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

  // Rows
  const [rows, setRows] = useState<RowData[] | undefined>(undefined);

  const clearEventsData = useCallback(() => {
    setRows(undefined);
  }, []);

  const fetchEventsData = useCallback(async () => {
    if (!obligation) return;

    clearEventsData();
    try {
      const response = await axios.get("/api/events", {
        params: {
          eventTypes: ALL_EVENT_TYPES.join(","),
          obligationId: obligation.id,
        },
      });

      // Parse
      const data = response.data as {
        deposit: DepositEvent[];
        borrow: BorrowEvent[];
        withdraw: WithdrawEvent[];
        repay: RepayEvent[];
        claimReward: ClaimRewardEvent[];
      };
      for (const event of Object.values(data).flat()) {
        event.coinType = normalizeStructTag(event.coinType);
      }

      const depositEvents = (data.deposit ?? [])
        .slice()
        .sort(eventSortFunction);
      const borrowEvents = (data.borrow ?? []).slice().sort(eventSortFunction);
      const withdrawEvents = (data.withdraw ?? [])
        .slice()
        .sort(eventSortFunction);
      const repayEvents = (data.repay ?? []).slice().sort(eventSortFunction);
      const claimRewardEvents = getDedupedClaimRewardEvents(
        (data.claimReward ?? []).slice().sort(eventSortFunction),
      );

      // const depositBorrowDigests = Array.from(
      //   new Set([
      //     ...data.deposit.map((event) => event.digest),
      //     ...data.borrow.map((event) => event.digest),
      //   ]),
      // );
      // const response2 = await axios.get("/api/events", {
      //   params: {
      //     eventTypes: ["reserveDataAsset"].join(","),
      //     digest: depositBorrowDigests.join(","),
      //   },
      // });
      // console.log("XXX", response2);

      const list = [
        ...depositEvents.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.DEPOSIT,
          event,
        })),
        ...borrowEvents.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.BORROW,
          event,
        })),
        ...withdrawEvents.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.WITHDRAW,
          event,
        })),
        ...repayEvents.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.REPAY,
          event,
        })),
        ...claimRewardEvents.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.CLAIM_REWARD,
          event,
        })),
      ].sort((a: RowData, b: RowData) =>
        eventSortFunction(a.event, b.event),
      ) as RowData[];

      setRows(list);
    } catch (e) {
      console.error(e);
    }
  }, [obligation, clearEventsData]);

  // State
  const onOpenChange = (isOpen: boolean) => {
    if (isOpen && rows === undefined) fetchEventsData();
  };

  // Filters
  const [filters, setFilters] = useState<string[]>(ALL_EVENT_TYPES);
  const toggleFilter = (eventType: string) => {
    setFilters((arr) =>
      arr.includes(eventType)
        ? arr.filter((f) => f !== eventType)
        : [...arr, eventType],
    );
  };

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
          {Object.values(EventType).map((eventType) => (
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
          tableClassName="border-y-0 relative"
          tableHeaderRowClassName="border-none"
          tableHeadClassName={(header) =>
            cn(
              "sticky bg-popover top-0 z-2",
              header.id === "digest" ? "w-16" : "w-auto",
            )
          }
          tableCellClassName="py-0 h-12 z-1"
          columns={columns}
          data={filteredRows}
          noDataMessage={
            filters.length === ALL_EVENT_TYPES.length
              ? "No history"
              : "No history for the selected filters"
          }
        />
      </DialogContent>
    </Dialog>
  );
}
