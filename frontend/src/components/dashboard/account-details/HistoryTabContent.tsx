import { useMemo, useState } from "react";

import { ColumnDef, Row } from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import { formatDate } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  EventsData,
  TokenAmount,
  getCtokenExchangeRate,
} from "@/components/dashboard/account-details/AccountDetailsDialog";
import DataTable, { tableHeader } from "@/components/dashboard/DataTable";
import Button from "@/components/shared/Button";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import { TBody, TLabel, TLabelSans } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import {
  BorrowEvent,
  ClaimRewardEvent,
  DepositEvent,
  EventType,
  EventTypeNameMap,
  LiquidateEvent,
  RepayEvent,
  WithdrawEvent,
  eventSortAsc,
  eventSortDesc,
} from "@/lib/events";
import { formatToken } from "@/lib/format";
import { cn } from "@/lib/utils";

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

interface HistoryTabContentProps {
  eventsData: EventsData | undefined;
}

export default function HistoryTabContent({
  eventsData,
}: HistoryTabContentProps) {
  const { explorer, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // Columns
  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        id: "date",
        accessorKey: "date",
        sortingFn: (rowA: Row<RowData>, rowB: Row<RowData>) =>
          eventSortAsc(rowA.original, rowB.original),
        header: ({ column }) =>
          tableHeader(column, "Date", { isDate: true, borderBottom: true }),
        cell: ({ row }) => {
          const isGroupRow = row.getCanExpand() && row.subRows.length > 1;
          const { timestamp } = row.original;

          if (isGroupRow)
            return <TLabel className="w-max uppercase">Multiple</TLabel>;
          return (
            <TBody className="w-max">
              {formatDate(new Date(timestamp * 1000), "yyyy-MM-dd HH:mm:ss")}
            </TBody>
          );
        },
      },
      {
        id: "type",
        accessorKey: "type",
        enableSorting: false,
        filterFn: (row, key, value: EventType[]) =>
          value.includes(row.original.type),
        header: ({ column }) =>
          tableHeader(column, "Action", { borderBottom: true }),
        cell: ({ row }) => {
          const isGroupRow = row.getCanExpand() && row.subRows.length > 1;
          const { type } = row.original;

          return (
            <TBody className="w-max uppercase">
              {EventTypeNameMap[type]}
              {isGroupRow && (
                <span className="text-muted-foreground">{` (${row.subRows.length})`}</span>
              )}
            </TBody>
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
          const isGroupRow = row.getCanExpand() && row.subRows.length > 1;
          const { type, event } = row.original;

          if (type === EventType.DEPOSIT) {
            const depositEvent = event as DepositEvent;
            const coinMetadata = data.coinMetadataMap[depositEvent.coinType];

            const reserveAssetDataEvent = eventsData?.reserveAssetData.find(
              (e) => e.digest === depositEvent.digest,
            );

            let amount;
            if (reserveAssetDataEvent) {
              amount = new BigNumber(depositEvent.ctokenAmount)
                .times(getCtokenExchangeRate(reserveAssetDataEvent))
                .div(10 ** coinMetadata.decimals);
            }

            return (
              <TokenAmount
                amount={amount}
                coinType={depositEvent.coinType}
                symbol={coinMetadata.symbol}
                src={coinMetadata.iconUrl}
                decimals={coinMetadata.decimals}
              />
            );
          } else if (type === EventType.BORROW) {
            const borrowEvent = event as BorrowEvent;
            const coinMetadata = data.coinMetadataMap[borrowEvent.coinType];

            const incFeesAmount = new BigNumber(
              borrowEvent.liquidityAmount,
            ).div(10 ** coinMetadata.decimals);
            const feesAmount = new BigNumber(
              borrowEvent.originationFeeAmount,
            ).div(10 ** coinMetadata.decimals);
            const amount = incFeesAmount.minus(feesAmount);

            return (
              <div className="flex w-max flex-col gap-1">
                <TokenAmount
                  amount={amount}
                  coinType={borrowEvent.coinType}
                  symbol={coinMetadata.symbol}
                  src={coinMetadata.iconUrl}
                  decimals={coinMetadata.decimals}
                />

                <TLabelSans className="w-max">
                  +{formatToken(feesAmount, { dp: coinMetadata.decimals })}{" "}
                  {coinMetadata.symbol} in fees
                </TLabelSans>
              </div>
            );
          } else if (type === EventType.WITHDRAW) {
            const withdrawEvent = event as WithdrawEvent;
            const coinMetadata = data.coinMetadataMap[withdrawEvent.coinType];

            const reserveAssetDataEvent = eventsData?.reserveAssetData.find(
              (e) => e.digest === withdrawEvent.digest,
            );

            let amount;
            if (reserveAssetDataEvent) {
              amount = new BigNumber(withdrawEvent.ctokenAmount)
                .times(getCtokenExchangeRate(reserveAssetDataEvent))
                .div(10 ** coinMetadata.decimals);
            }

            return (
              <TokenAmount
                amount={amount}
                coinType={withdrawEvent.coinType}
                symbol={coinMetadata.symbol}
                src={coinMetadata.iconUrl}
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
                src={coinMetadata.iconUrl}
                decimals={coinMetadata.decimals}
              />
            );
          } else if (type === EventType.LIQUIDATE) {
            const liquidateEvent = event as LiquidateEvent;

            const repayReserve = data.lendingMarket.reserves.find(
              (reserve) => reserve.id === liquidateEvent.repayReserveId,
            );
            const withdrawReserve = data.lendingMarket.reserves.find(
              (reserve) => reserve.id === liquidateEvent.withdrawReserveId,
            );
            if (!repayReserve || !withdrawReserve)
              return (
                <TLabelSans className="w-max">
                  {isGroupRow ? "N/A" : "See txn for details"}
                </TLabelSans>
              );

            let withdrawAmount = new BigNumber(0);
            let repayAmount = new BigNumber(0);

            if (isGroupRow) {
              for (const subRow of row.subRows) {
                const subRowLiquidateEvent = subRow.original
                  .event as LiquidateEvent;

                const reserveAssetDataEvent = eventsData?.reserveAssetData.find(
                  (e) => e.digest === subRowLiquidateEvent.digest,
                );
                if (!reserveAssetDataEvent)
                  return <TLabelSans className="w-max">N/A</TLabelSans>;

                withdrawAmount = withdrawAmount.plus(
                  new BigNumber(subRowLiquidateEvent.withdrawAmount)
                    .times(getCtokenExchangeRate(reserveAssetDataEvent))
                    .div(10 ** withdrawReserve.mintDecimals),
                );
                repayAmount = repayAmount.plus(
                  new BigNumber(subRowLiquidateEvent.repayAmount).div(
                    10 ** repayReserve.mintDecimals,
                  ),
                );
              }
            } else {
              const reserveAssetDataEvent = eventsData?.reserveAssetData.find(
                (e) => e.digest === liquidateEvent.digest,
              );
              if (!reserveAssetDataEvent)
                return (
                  <TLabelSans className="w-max">See txn for details</TLabelSans>
                );

              withdrawAmount = withdrawAmount.plus(
                new BigNumber(liquidateEvent.withdrawAmount)
                  .times(getCtokenExchangeRate(reserveAssetDataEvent))
                  .div(10 ** withdrawReserve.mintDecimals),
              );
              repayAmount = repayAmount.plus(
                new BigNumber(liquidateEvent.repayAmount).div(
                  10 ** repayReserve.mintDecimals,
                ),
              );
            }

            return (
              <div className="flex w-max flex-col">
                <div className="flex w-max flex-row items-center gap-2">
                  <TLabelSans>Deposits liquidated</TLabelSans>
                  <TokenAmount
                    amount={withdrawAmount}
                    coinType={withdrawReserve.coinType}
                    symbol={withdrawReserve.symbol}
                    src={withdrawReserve.iconUrl}
                    decimals={withdrawReserve.mintDecimals}
                  />
                </div>
                <div className="flex w-max flex-row items-center gap-2">
                  <TLabelSans>Borrows repaid</TLabelSans>
                  <TokenAmount
                    amount={repayAmount}
                    coinType={repayReserve.coinType}
                    symbol={repayReserve.symbol}
                    src={repayReserve.iconUrl}
                    decimals={repayReserve.mintDecimals}
                  />
                </div>
              </div>
            );
          } else if (type === EventType.CLAIM_REWARD) {
            const claimRewardEvent = event as ClaimRewardEvent;
            const coinMetadata =
              data.coinMetadataMap[claimRewardEvent.coinType];

            const claimedAmount = new BigNumber(
              claimRewardEvent.liquidityAmount,
            ).div(10 ** coinMetadata.decimals);

            return (
              <TokenAmount
                amount={claimedAmount}
                coinType={claimRewardEvent.coinType}
                symbol={coinMetadata.symbol}
                src={coinMetadata.iconUrl}
                decimals={coinMetadata.decimals}
              />
            );
          }
        },
      },
      {
        id: "digest",
        accessorKey: "digest",
        enableSorting: false,
        header: ({ column }) =>
          tableHeader(column, "Txn", { borderBottom: true }),
        cell: ({ row }) => {
          const isGroupRow = row.getCanExpand() && row.subRows.length > 1;
          const { event } = row.original;

          if (isGroupRow) {
            const isExpanded = row.getIsExpanded();
            const Icon = isExpanded ? ChevronUp : ChevronDown;

            return (
              <div className="flex h-8 w-8 flex-row items-center justify-center">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          } else {
            return (
              <OpenOnExplorerButton url={explorer.buildTxUrl(event.digest)} />
            );
          }
        },
      },
    ],
    [
      data.coinMetadataMap,
      eventsData?.reserveAssetData,
      data.lendingMarket.reserves,
      explorer,
    ],
  );

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
  const rows = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const sortedRows = Object.entries(eventsData)
      .reduce((acc: RowData[], [key, value]) => {
        if ((key as EventType) === EventType.RESERVE_ASSET_DATA) return acc;

        return [
          ...acc,
          ...value.map(
            (event) =>
              ({
                timestamp: event.timestamp,
                eventIndex: event.eventIndex,
                type: key as EventType,
                event,
              }) as RowData,
          ),
        ];
      }, [])
      .sort(eventSortDesc);

    // Group liquidate events
    const finalRows: RowData[] = [];
    for (let i = 0; i < sortedRows.length; i++) {
      const row = sortedRows[i];

      if (row.type !== EventType.LIQUIDATE) finalRows.push(row);
      else {
        const lastRow = finalRows[finalRows.length - 1];

        if (
          !lastRow ||
          lastRow.type !== EventType.LIQUIDATE ||
          (lastRow.event as LiquidateEvent).repayReserveId !==
            (row.event as LiquidateEvent).repayReserveId ||
          (lastRow.event as LiquidateEvent).withdrawReserveId !==
            (row.event as LiquidateEvent).withdrawReserveId
        ) {
          finalRows.push({
            ...row,
            subRows: [row],
          });
        } else {
          (lastRow.subRows as RowData[]).push(row);
        }
      }
    }

    return finalRows;
  }, [eventsData]);

  return (
    <>
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
        data={rows}
        noDataMessage={
          filters.length === initialFilters.length
            ? "No history"
            : "No history for the active filters"
        }
        columnFilters={[{ id: "type", value: filters }]}
        skeletonRows={20}
        container={{
          className: cn(rows === undefined && "overflow-y-hidden"),
        }}
        tableClassName="border-y-0 relative"
        tableHeaderRowClassName="border-none"
        tableHeadClassName={(header) =>
          cn(
            "sticky bg-popover top-0 z-[2]",
            header.id === "digest" ? "w-16" : "w-auto",
          )
        }
        tableRowClassName={(row) => {
          if (!row) return;
          const isGroupRow = row.getCanExpand() && row.subRows.length > 1;
          const isNested = !!row.getParentRow();

          return cn(
            isGroupRow && row.getIsExpanded() && "!bg-muted/10",
            isNested && "!bg-card",
          );
        }}
        tableCellClassName={(cell) =>
          cn(
            "z-[1]",
            cell &&
              [EventType.BORROW, EventType.LIQUIDATE].includes(
                cell.row.original.type,
              )
              ? "py-2 h-auto"
              : "py-0 h-12",
          )
        }
        onRowClick={(row) => {
          const isGroupRow = row.getCanExpand() && row.subRows.length > 1;
          if (isGroupRow) return row.getToggleExpandedHandler();
        }}
      />
    </>
  );
}
