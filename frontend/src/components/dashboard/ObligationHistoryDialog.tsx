import { CSSProperties, useCallback, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { formatDate } from "date-fns";
import { FileClock, RefreshCcw } from "lucide-react";

import DataTable, { tableHeader } from "@/components/dashboard/DataTable";
import Button from "@/components/shared/Button";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import { TBody, TTitle } from "@/components/shared/Typography";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

enum EventType {
  DEPOSIT = "deposit",
  BORROW = "borrow",
  WITHDRAW = "withdraw",
  REPAY = "repay",
  CLAIM_REWARD = "claimReward",
}

type DepositEvent = {
  id: number;
  lendingMarket: string;
  coinType: string;
  reserveId: string;
  obligationId: string;
  ctokenAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

type BorrowEvent = {
  id: number;
  lendingMarket: string;
  coinType: string;
  reserveId: string;
  obligationId: string;
  liquidityAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

type WithdrawEvent = {
  id: number;
  lendingMarket: string;
  coinType: string;
  reserveId: string;
  obligationId: string;
  ctokenAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

type RepayEvent = {
  id: number;
  lendingMarket: string;
  coinType: string;
  reserveId: string;
  obligationId: string;
  liquidityAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

type ClaimRewardEvent = {
  id: number;
  coinType: string;
  isDepositReward: boolean;
  lendingMarketId: string;
  liquidityAmount: string;
  obligationId: string;
  poolRewardId: string;
  reserveId: string;
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

export default function ObligationHistoryDialog() {
  const { explorer, obligation } = useAppContext();

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

        return <TBody>{formatDate(date, "yyyy-MM-dd HH:mm:ss")}</TBody>;
      },
    },
    {
      id: "type",
      accessorKey: "type",
      enableSorting: false,
      header: ({ column }) =>
        tableHeader(column, "Txn Type", { borderBottom: true }),
      cell: ({ row }) => {
        const { type } = row.original;

        return (
          <TBody className="uppercase">
            {type === EventType.DEPOSIT && "Deposit"}
            {type === EventType.BORROW && "Borrow"}
            {type === EventType.WITHDRAW && "Withdraw"}
            {type === EventType.REPAY && "Repay"}
            {type === EventType.CLAIM_REWARD && "Claim reward"}
          </TBody>
        );
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
          eventTypes: [
            "deposit",
            "borrow",
            "withdraw",
            "repay",
            "claimReward",
          ].join(","),
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
      for (const event of data.deposit) {
        event.coinType = normalizeStructTag(event.coinType);
      }
      for (const event of data.borrow) {
        event.coinType = normalizeStructTag(event.coinType);
      }
      for (const event of data.withdraw) {
        event.coinType = normalizeStructTag(event.coinType);
      }
      for (const event of data.repay) {
        event.coinType = normalizeStructTag(event.coinType);
      }
      for (const event of data.claimReward) {
        event.coinType = normalizeStructTag(event.coinType);
      }

      const list = [
        ...data.deposit.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.DEPOSIT,
          event,
        })),
        ...data.borrow.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.BORROW,
          event,
        })),
        ...data.withdraw.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.WITHDRAW,
          event,
        })),
        ...data.repay.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.REPAY,
          event,
        })),
        ...data.claimReward.map((event) => ({
          date: new Date(event.timestamp * 1000),
          type: EventType.CLAIM_REWARD,
          event,
        })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime()) as RowData[];

      setRows(list);
    } catch (e) {
      console.error(e);
    }
  }, [obligation, clearEventsData]);

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) fetchEventsData();
    else clearEventsData();
  };

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

        <DataTable<RowData>
          tableClassName="border-y-0 table-fixed relative"
          tableHeaderRowClassName="border-none"
          tableHeadClassName={(header) =>
            cn(
              "sticky bg-popover top-0",
              header.id === "digest" ? "w-16" : "w-auto",
            )
          }
          tableCellClassName="py-0 h-12"
          columns={columns}
          data={rows}
          noDataMessage="No history"
        />
      </DialogContent>
    </Dialog>
  );
}
