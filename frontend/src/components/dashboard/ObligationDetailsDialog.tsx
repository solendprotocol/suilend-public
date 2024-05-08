import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import { formatDate } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  FileClock,
  HandCoins,
  RotateCw,
} from "lucide-react";

import { WAD } from "@suilend/sdk/constants";
import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import DataTable, {
  decimalSortingFn,
  tableHeader,
} from "@/components/dashboard/DataTable";
import Dialog from "@/components/dashboard/Dialog";
import ObligationSwitcherPopover from "@/components/dashboard/ObligationSwitcherPopover";
import Button from "@/components/shared/Button";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import Tabs from "@/components/shared/Tabs";
import TokenIcon from "@/components/shared/TokenIcon";
import {
  TBody,
  TLabel,
  TLabelSans,
  TTitle,
} from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import { formatToken, formatUsd } from "@/lib/format";
import { API_URL } from "@/lib/navigation";
import { cn, reserveSort } from "@/lib/utils";

const getCtokenExchangeRate = (event: ReserveAssetDataEvent) =>
  new BigNumber(new BigNumber(event.supplyAmount).div(WAD.toString())).div(
    event.ctokenSupply,
  );

type EventsData = {
  reserveAssetData: ReserveAssetDataEvent[];

  deposit: DepositEvent[];
  borrow: BorrowEvent[];
  withdraw: WithdrawEvent[];
  repay: RepayEvent[];
  liquidate: LiquidateEvent[];
  claimReward: ClaimRewardEvent[];
};

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

interface HistoryTabProps {
  eventsData: EventsData | undefined;
}

function HistoryTab({ eventsData }: HistoryTabProps) {
  const { explorer, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // Columns
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

  const columns: ColumnDef<RowData>[] = [
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
              iconUrl={coinMetadata.iconUrl}
              decimals={coinMetadata.decimals}
            />
          );
        } else if (type === EventType.BORROW) {
          const borrowEvent = event as BorrowEvent;
          const coinMetadata = data.coinMetadataMap[borrowEvent.coinType];

          const incFeesAmount = new BigNumber(borrowEvent.liquidityAmount).div(
            10 ** coinMetadata.decimals,
          );
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
                iconUrl={coinMetadata.iconUrl}
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
                  iconUrl={withdrawReserve.iconUrl}
                  decimals={withdrawReserve.mintDecimals}
                />
              </div>
              <div className="flex w-max flex-row items-center gap-2">
                <TLabelSans>Borrows repaid</TLabelSans>
                <TokenAmount
                  amount={repayAmount}
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

          const claimedAmount = new BigNumber(
            claimRewardEvent.liquidityAmount,
          ).div(10 ** coinMetadata.decimals);

          return (
            <TokenAmount
              amount={claimedAmount}
              coinType={claimRewardEvent.coinType}
              symbol={coinMetadata.symbol}
              iconUrl={coinMetadata.iconUrl}
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
  ];

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
  const rows = (() => {
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
  })();

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

interface EarningsTabProps {
  eventsData: EventsData | undefined;
}

function EarningsTab({ eventsData }: EarningsTabProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const obligation = appContext.obligation as ParsedObligation;

  // Data
  const interestEarned = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const netDeposits: Record<string, BigNumber> = {};
    const netDepositsUsd: Record<string, BigNumber> = {};

    eventsData.deposit.forEach((depositEvent) => {
      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === depositEvent.digest,
      );
      if (!reserveAssetDataEvent) return;

      if (netDeposits[depositEvent.coinType] === undefined)
        netDeposits[depositEvent.coinType] = new BigNumber(0);
      if (netDepositsUsd[depositEvent.coinType] === undefined)
        netDepositsUsd[depositEvent.coinType] = new BigNumber(0);

      const coinMetadata = data.coinMetadataMap[depositEvent.coinType];

      const amount = new BigNumber(depositEvent.ctokenAmount)
        .times(getCtokenExchangeRate(reserveAssetDataEvent))
        .div(10 ** coinMetadata.decimals);
      const amountUsd = amount
        .times(reserveAssetDataEvent.price)
        .div(WAD.toString());

      netDeposits[depositEvent.coinType] =
        netDeposits[depositEvent.coinType].plus(amount);
      netDepositsUsd[depositEvent.coinType] =
        netDepositsUsd[depositEvent.coinType].plus(amountUsd);
    });

    eventsData.withdraw.forEach((withdrawEvent) => {
      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === withdrawEvent.digest,
      );
      if (!reserveAssetDataEvent) return;

      if (netDeposits[withdrawEvent.coinType] === undefined)
        netDeposits[withdrawEvent.coinType] = new BigNumber(0);
      if (netDepositsUsd[withdrawEvent.coinType] === undefined)
        netDepositsUsd[withdrawEvent.coinType] = new BigNumber(0);

      const coinMetadata = data.coinMetadataMap[withdrawEvent.coinType];

      const amount = new BigNumber(withdrawEvent.ctokenAmount)
        .times(getCtokenExchangeRate(reserveAssetDataEvent))
        .div(10 ** coinMetadata.decimals);
      const amountUsd = amount
        .times(reserveAssetDataEvent.price)
        .div(WAD.toString());

      netDeposits[withdrawEvent.coinType] =
        netDeposits[withdrawEvent.coinType].minus(amount);
      netDepositsUsd[withdrawEvent.coinType] =
        netDepositsUsd[withdrawEvent.coinType].minus(amountUsd);
    });

    eventsData.liquidate.forEach((liquidateEvent) => {
      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === liquidateEvent.digest,
      );
      if (!reserveAssetDataEvent) return;

      const withdrawReserve = data.lendingMarket.reserves.find(
        (reserve) => reserve.id === liquidateEvent.withdrawReserveId,
      );
      if (!withdrawReserve) return;

      if (netDeposits[withdrawReserve.coinType] === undefined)
        netDeposits[withdrawReserve.coinType] = new BigNumber(0);
      if (netDepositsUsd[withdrawReserve.coinType] === undefined)
        netDepositsUsd[withdrawReserve.coinType] = new BigNumber(0);

      const withdrawAmount = new BigNumber(liquidateEvent.withdrawAmount)
        .times(getCtokenExchangeRate(reserveAssetDataEvent))
        .div(10 ** withdrawReserve.mintDecimals);
      const withdrawAmountUsd = withdrawAmount
        .times(reserveAssetDataEvent.price)
        .div(WAD.toString());

      netDeposits[withdrawReserve.coinType] =
        netDeposits[withdrawReserve.coinType].minus(withdrawAmount);
      netDepositsUsd[withdrawReserve.coinType] =
        netDepositsUsd[withdrawReserve.coinType].minus(withdrawAmountUsd);
    });

    const result: Record<string, BigNumber> = {};
    Object.entries(netDeposits).forEach(([coinType, netDeposit]) => {
      const currentDeposit = obligation.deposits.find(
        (deposit) => deposit.coinType === coinType,
      );

      result[coinType] = new BigNumber(0)
        .plus(currentDeposit?.depositedAmount ?? 0)
        .minus(netDeposit);
    });

    // const totalInterestEarnedUsd: Record<string, BigNumber> = {};
    // Object.entries(netDepositsUsd).forEach(([coinType, netDepositUsd]) => {
    //   const currentDeposit = obligation.deposits.find(
    //     (deposit) => deposit.coinType === coinType,
    //   );

    //   totalInterestEarnedUsd[coinType] = new BigNumber(0)
    //     .plus(currentDeposit?.depositedAmountUsd ?? 0)
    //     .minus(netDepositUsd);
    // });

    return result;
  }, [
    eventsData,
    data.coinMetadataMap,
    data.lendingMarket.reserves,
    obligation.deposits,
  ]);

  const interestPaid = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const netBorrows: Record<string, BigNumber> = {};

    eventsData.borrow.forEach((borrowEvent) => {
      if (netBorrows[borrowEvent.coinType] === undefined)
        netBorrows[borrowEvent.coinType] = new BigNumber(0);

      const coinMetadata = data.coinMetadataMap[borrowEvent.coinType];

      const incFeesAmount = new BigNumber(borrowEvent.liquidityAmount).div(
        10 ** coinMetadata.decimals,
      );

      netBorrows[borrowEvent.coinType] =
        netBorrows[borrowEvent.coinType].plus(incFeesAmount);
    });

    eventsData.repay.forEach((repayEvent) => {
      if (netBorrows[repayEvent.coinType] === undefined)
        netBorrows[repayEvent.coinType] = new BigNumber(0);

      const coinMetadata = data.coinMetadataMap[repayEvent.coinType];

      const amount = new BigNumber(repayEvent.liquidityAmount).div(
        10 ** coinMetadata.decimals,
      );

      netBorrows[repayEvent.coinType] =
        netBorrows[repayEvent.coinType].minus(amount);
    });

    eventsData.liquidate.forEach((liquidateEvent) => {
      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === liquidateEvent.digest,
      );
      if (!reserveAssetDataEvent) return;

      const repayReserve = data.lendingMarket.reserves.find(
        (reserve) => reserve.id === liquidateEvent.repayReserveId,
      );
      if (!repayReserve) return;

      if (netBorrows[repayReserve.coinType] === undefined)
        netBorrows[repayReserve.coinType] = new BigNumber(0);

      const repayAmount = new BigNumber(liquidateEvent.repayAmount)
        .times(getCtokenExchangeRate(reserveAssetDataEvent))
        .div(10 ** repayReserve.mintDecimals);

      netBorrows[repayReserve.coinType] =
        netBorrows[repayReserve.coinType].minus(repayAmount);
    });

    const result: Record<string, BigNumber> = {};
    Object.entries(netBorrows).forEach(([coinType, netBorrow]) => {
      const currentBorrow = obligation.borrows.find(
        (borrow) => borrow.coinType === coinType,
      );

      result[coinType] = new BigNumber(0)
        .plus(currentBorrow?.borrowedAmount ?? 0)
        .minus(netBorrow);
    });

    return result;
  }, [
    eventsData,
    data.coinMetadataMap,
    data.lendingMarket.reserves,
    obligation.borrows,
  ]);

  // Totals
  const totalInterestEarnedUsd =
    interestEarned !== undefined
      ? Object.entries(interestEarned).reduce((acc, [coinType, earned]) => {
          const reserve = data.reserveMap[coinType];
          if (!reserve) return acc;

          return acc.plus(earned.times(reserve.price));
        }, new BigNumber(0))
      : undefined;
  const totalInterestPaidUsd =
    interestPaid !== undefined
      ? Object.entries(interestPaid).reduce((acc, [coinType, paid]) => {
          const reserve = data.reserveMap[coinType];
          if (!reserve) return acc;

          return acc.plus(paid.times(reserve.price));
        }, new BigNumber(0))
      : undefined;

  const totalEarningsUsd =
    totalInterestEarnedUsd !== undefined && totalInterestPaidUsd !== undefined
      ? totalInterestEarnedUsd.minus(totalInterestPaidUsd)
      : undefined;

  // Columns
  interface RowData {
    coinType: string;
    amount: BigNumber;
  }

  const columns = (amountTitle: string): ColumnDef<RowData>[] => [
    {
      accessorKey: "coinType",
      sortingFn: "text",
      header: ({ column }) => tableHeader(column, "Asset name"),
      cell: ({ row }) => {
        const { coinType } = row.original;

        const coinMetadata = data.coinMetadataMap[coinType];

        return (
          <div className="flex w-max flex-row items-center gap-2">
            <TokenIcon
              className="h-4 w-4"
              coinType={coinType}
              symbol={coinMetadata.symbol}
              url={coinMetadata.iconUrl}
            />

            <TBody>{coinMetadata.symbol}</TBody>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      sortingFn: decimalSortingFn("amount"),
      header: ({ column }) =>
        tableHeader(column, amountTitle, { isNumerical: true }),
      cell: ({ row }) => {
        const { coinType, amount } = row.original;

        const coinMetadata = data.coinMetadataMap[coinType];

        return (
          <div className="flex flex-col items-end gap-1">
            <TBody className="w-max text-right">
              {formatToken(amount, { dp: coinMetadata.decimals })}{" "}
              {coinMetadata.symbol}
            </TBody>
          </div>
        );
      },
    },
  ];

  // Rows
  const earnedRows = (() => {
    if (interestEarned === undefined) return undefined;

    return Object.entries(interestEarned)
      .reduce(
        (acc: RowData[], [coinType, earned]) => [
          ...acc,
          { coinType, amount: earned } as RowData,
        ],
        [],
      )
      .sort((a, b) =>
        reserveSort(data.reserveMap[a.coinType], data.reserveMap[b.coinType]),
      );
  })();

  const paidRows = (() => {
    if (interestPaid === undefined) return undefined;

    return Object.entries(interestPaid)
      .reduce(
        (acc: RowData[], [coinType, paid]) => [
          ...acc,
          { coinType, amount: paid } as RowData,
        ],
        [],
      )
      .sort((a, b) =>
        reserveSort(data.reserveMap[a.coinType], data.reserveMap[b.coinType]),
      );
  })();

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-auto pt-4">
      <div className="flex flex-col gap-2">
        <div className="mx-4 flex flex-row gap-4 rounded-sm bg-muted/10 p-4">
          <div className="flex flex-1 flex-col items-center gap-1">
            <TLabel className="text-center uppercase">Net earnings</TLabel>
            <TBody
              className={cn(
                totalEarningsUsd !== undefined &&
                  totalEarningsUsd.gt(0) &&
                  "text-success",
                totalEarningsUsd !== undefined &&
                  totalEarningsUsd.lt(0) &&
                  "text-destructive",
              )}
            >
              {totalEarningsUsd !== undefined ? (
                <>
                  {totalEarningsUsd.lt(0) && "-"}
                  {formatUsd(totalEarningsUsd.abs())}
                </>
              ) : (
                <Skeleton className="h-5 w-12" />
              )}
            </TBody>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1">
            <TLabel className="text-center uppercase">Deposit interest</TLabel>
            <TBody className="text-center">
              {totalInterestEarnedUsd !== undefined ? (
                formatUsd(totalInterestEarnedUsd)
              ) : (
                <Skeleton className="h-5 w-12" />
              )}
            </TBody>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1">
            <TLabel className="text-center uppercase">Borrow interest</TLabel>
            <TBody className="text-right">
              {totalInterestPaidUsd !== undefined ? (
                formatUsd(totalInterestPaidUsd)
              ) : (
                <Skeleton className="h-5 w-12" />
              )}
            </TBody>
          </div>
        </div>

        <TLabelSans className="px-4">
          Note: USD values of earnings are calculated using current prices.
        </TLabelSans>
      </div>

      <div className="flex flex-col gap-4">
        <TTitle className="px-4 uppercase">Assets deposited</TTitle>
        <DataTable<RowData>
          columns={columns("Interest earned")}
          data={earnedRows}
          noDataMessage="No interest earned"
          skeletonRows={data.lendingMarket.reserves.length}
          container={{
            className: "overflow-visible",
          }}
          tableClassName="border-t-0"
          tableCellClassName={() => "py-0 h-12"}
        />
      </div>

      <div className="flex flex-col gap-4">
        <TTitle className="px-4 uppercase">Assets borrowed</TTitle>
        <DataTable<RowData>
          columns={columns("Interest paid")}
          data={paidRows}
          noDataMessage="No interest paid"
          skeletonRows={data.lendingMarket.reserves.length}
          container={{
            className: "overflow-visible",
          }}
          tableClassName="border-t-0"
          tableCellClassName={() => "py-0 h-12"}
        />
      </div>
    </div>
  );
}

export default function ObligationDetailsDialog() {
  const router = useRouter();
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // Tabs
  enum Tab {
    HISTORY = "history",
    EARNINGS = "earnings",
  }

  const tabs = [
    { id: Tab.HISTORY, icon: <FileClock />, title: "History" },
    { id: Tab.EARNINGS, icon: <HandCoins />, title: "Earnings" },
  ];

  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.HISTORY);

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
        const url1 = `${API_URL}/events?${new URLSearchParams({
          eventTypes: [
            EventType.DEPOSIT,
            EventType.WITHDRAW,
            EventType.LIQUIDATE,
          ].join(","),
          obligationId,
          joinEventTypes: EventType.RESERVE_ASSET_DATA,
        })}`;
        const res1 = await fetch(url1);
        const json1 = await res1.json();

        const url2 = `${API_URL}/events?${new URLSearchParams({
          eventTypes: [
            EventType.BORROW,
            EventType.REPAY,
            EventType.CLAIM_REWARD,
          ].join(","),
          obligationId,
        })}`;
        const res2 = await fetch(url2);
        const json2 = await res2.json();

        // Parse
        const data = { ...json1, ...json2 } as EventsData;
        for (const event of [
          ...data.deposit,
          ...data.borrow,
          ...data.withdraw,
          ...data.repay,
          ...data.claimReward,
        ]) {
          event.coinType = normalizeStructTag(event.coinType);
        }

        setEventsData({
          reserveAssetData: (data.reserveAssetData ?? [])
            .slice()
            .sort(eventSortAsc),

          deposit: (data.deposit ?? []).slice().sort(eventSortDesc),
          borrow: (data.borrow ?? []).slice().sort(eventSortDesc),
          withdraw: (data.withdraw ?? []).slice().sort(eventSortDesc),
          repay: (data.repay ?? []).slice().sort(eventSortDesc),
          liquidate: (data.liquidate ?? []).slice().sort(eventSortDesc),
          claimReward: getDedupedClaimRewardEvents(
            (data.claimReward ?? []).slice().sort(eventSortDesc),
          ),
        });
      } catch (err) {
        console.error(err);
      }
    },
    [obligation?.id, clearEventsData],
  );

  // State
  const isOpen = router.query.showAccountDetails !== undefined;

  const onOpenChange = (_isOpen: boolean) => {
    const { showAccountDetails, ...restQuery } = router.query;

    router.push({
      query: _isOpen ? { ...restQuery, showAccountDetails: true } : restQuery,
    });
  };

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

  if (!obligation) return null;
  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      trigger={
        <Button
          className="text-muted-foreground"
          tooltip="View account details (history, earnings)"
          icon={<Eye />}
          size="icon"
          variant="ghost"
        >
          View account details (history, earnings)
        </Button>
      }
      headerClassName="border-b-0"
      title="Account"
      headerEndContent={
        <>
          {data.obligations && data.obligations.length > 1 && (
            <ObligationSwitcherPopover onSelect={fetchEventsData} />
          )}

          <Button
            className="text-muted-foreground"
            tooltip="Refresh"
            icon={<RotateCw />}
            variant="ghost"
            size="icon"
            onClick={() => fetchEventsData()}
          >
            Refresh
          </Button>
        </>
      }
    >
      <div className="px-4">
        <Tabs
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={(tab) => setSelectedTab(tab as Tab)}
        />
      </div>
      <Separator />

      {selectedTab === Tab.HISTORY && <HistoryTab eventsData={eventsData} />}
      {selectedTab === Tab.EARNINGS && <EarningsTab eventsData={eventsData} />}
    </Dialog>
  );
}
