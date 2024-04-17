import { PropsWithChildren } from "react";

import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import ActionsModal from "@/components/dashboard/actions-modal/ActionsModal";
import DataTable, {
  decimalSortingFn,
  tableHeader,
} from "@/components/dashboard/DataTable";
import AssetCell from "@/components/dashboard/market-table/AssetCell";
import BorrowAprCell from "@/components/dashboard/market-table/BorrowAprCell";
import DepositAprCell from "@/components/dashboard/market-table/DepositAprCell";
import OpenLtvBwCell from "@/components/dashboard/market-table/OpenLtvBwCell";
import TotalBorrowsCell from "@/components/dashboard/market-table/TotalBorrowsCell";
import TotalDepositsCell from "@/components/dashboard/market-table/TotalDepositsCell";
import MarketCardList from "@/components/dashboard/MarketCardList";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { formatToken, formatUsd } from "@/lib/format";
import {
  RewardSummary,
  getFilteredRewards,
  getTotalAprPercent,
} from "@/lib/liquidityMining";
import { OPEN_LTV_BW_TOOLTIP } from "@/lib/tooltips";

export interface ReservesRowData {
  coinType: string;
  price: BigNumber;
  symbol: string;
  iconUrl?: string;
  openLtvPct: number;
  borrowWeight: number;
  totalDeposits: BigNumber;
  totalDepositsUsd: BigNumber;
  totalDepositsTooltip?: string;
  totalBorrows: BigNumber;
  totalBorrowsUsd: BigNumber;
  totalBorrowsTooltip?: string;
  depositAprPercent: BigNumber;
  totalDepositAprPercent: BigNumber;
  borrowAprPercent: BigNumber;
  totalBorrowAprPercent: BigNumber;
  rewards?: {
    deposit: RewardSummary[];
    borrow: RewardSummary[];
  };
  reserve: ParsedReserve;
}

const columns: ColumnDef<ReservesRowData>[] = [
  {
    accessorKey: "symbol",
    sortingFn: "text",
    header: ({ column }) => tableHeader(column, "Asset name"),
    cell: ({ row }) => <AssetCell {...row.original} />,
  },
  {
    accessorKey: "openLtvBw",
    enableSorting: false,
    header: ({ column }) =>
      tableHeader(column, "LTV / BW", {
        tooltip: OPEN_LTV_BW_TOOLTIP,
      }),
    cell: ({ row }) => <OpenLtvBwCell {...row.original} />,
  },
  {
    accessorKey: "totalDeposits",
    sortingFn: decimalSortingFn("totalDeposits"),
    header: ({ column }) =>
      tableHeader(column, "Total deposits", { isNumerical: true }),
    cell: ({ row }) => <TotalDepositsCell {...row.original} />,
  },
  {
    accessorKey: "depositAprPercent",
    sortingFn: decimalSortingFn("totalDepositAprPercent"),
    header: ({ column }) =>
      tableHeader(column, "Deposit APR", { isNumerical: true }),
    cell: ({ row }) => (
      <div className="flex flex-row justify-end">
        <DepositAprCell {...row.original} />
      </div>
    ),
  },
  {
    accessorKey: "totalBorrows",
    sortingFn: decimalSortingFn("totalBorrows"),
    header: ({ column }) =>
      tableHeader(column, "Total borrows", { isNumerical: true }),
    cell: ({ row }) => <TotalBorrowsCell {...row.original} />,
  },
  {
    accessorKey: "borrowAprPercent",
    sortingFn: decimalSortingFn("totalBorrowAprPercent"),
    header: ({ column }) =>
      tableHeader(column, "Borrow APR", { isNumerical: true }),
    cell: ({ row }) => (
      <div className="flex flex-row justify-end">
        <BorrowAprCell {...row.original} />
      </div>
    ),
  },
];

interface RowModalProps extends PropsWithChildren {
  row: ReservesRowData;
}

function RowModal({ row, children }: RowModalProps) {
  return <ActionsModal reserve={row.reserve}>{children}</ActionsModal>;
}

export default function MarketTable() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  const rowData = data.lendingMarket.reserves.map((reserve) => {
    const coinType = reserve.coinType;
    const price = reserve.price;
    const symbol = reserve.symbol;
    const iconUrl = reserve.iconUrl;
    const openLtvPct = reserve.config.openLtvPct;
    const borrowWeight = new BigNumber(
      reserve.config.borrowWeightBps.toString(),
    )
      .div(100 * 100)
      .toNumber();
    const totalDeposits = reserve.totalDeposits;
    const totalDepositsUsd = reserve.totalDeposits.times(reserve.price);
    const totalBorrows = reserve.borrowedAmount;
    const totalBorrowsUsd = reserve.borrowedAmount.times(reserve.price);
    const depositAprPercent = reserve.depositAprPercent;
    const totalDepositAprPercent = getTotalAprPercent(
      reserve.depositAprPercent,
      getFilteredRewards(data.rewardMap[coinType].deposit),
    );
    const borrowAprPercent = reserve.borrowAprPercent;
    const totalBorrowAprPercent = getTotalAprPercent(
      reserve.borrowAprPercent,
      getFilteredRewards(data.rewardMap[coinType].borrow),
    );
    const rewards = data.rewardMap[coinType];

    const getAlmostExceedsLimit = (limit: BigNumber, total: BigNumber) =>
      !limit.eq(0) &&
      total.gte(limit.times(Math.min(0.9999, 1 - 1 / limit.toNumber())));
    const getExceedsLimit = (limit: BigNumber, total: BigNumber) =>
      limit.eq(0) || total.gte(limit);

    const almostExceedsDepositLimit = getAlmostExceedsLimit(
      reserve.config.depositLimit,
      totalDeposits,
    );
    const almostExceedsDepositLimitUsd = getAlmostExceedsLimit(
      reserve.config.depositLimitUsd,
      totalDepositsUsd,
    );

    const exceedsDepositLimit = getExceedsLimit(
      reserve.config.depositLimit,
      totalDeposits,
    );
    const exceedsDepositLimitUsd = getExceedsLimit(
      reserve.config.depositLimitUsd,
      totalDepositsUsd,
    );

    const almostExceedsBorrowLimit = getAlmostExceedsLimit(
      reserve.config.borrowLimit,
      totalBorrows,
    );
    const almostExceedsBorrowLimitUsd = getAlmostExceedsLimit(
      reserve.config.borrowLimitUsd,
      totalBorrowsUsd,
    );

    const exceedsBorrowLimit = getExceedsLimit(
      reserve.config.borrowLimit,
      totalBorrows,
    );
    const exceedsBorrowLimitUsd = getExceedsLimit(
      reserve.config.borrowLimitUsd,
      totalBorrowsUsd,
    );

    const getAlmostExceedsLimitTooltip = (
      side: Side,
      remaining: BigNumber,
      symbol: string,
    ) =>
      `Asset ${side} limit almost reached. Capacity remaining: ${formatToken(remaining, { dp: reserve.mintDecimals })} ${symbol}`;
    const getAlmostExceedsLimitUsd = (side: Side, remaining: BigNumber) =>
      `Asset USD ${side} limit almost reached. Capacity remaining: ${formatUsd(remaining)}`;

    const getExceedsLimitTooltip = (side: Side) =>
      `Asset ${side} limit reached.`;
    const getExceedsLimitUsdTooltip = (side: Side) =>
      `Asset USD ${side} limit reached.`;

    const totalDepositsTooltip = exceedsDepositLimit
      ? getExceedsLimitTooltip(Side.DEPOSIT)
      : exceedsDepositLimitUsd
        ? getExceedsLimitUsdTooltip(Side.DEPOSIT)
        : almostExceedsDepositLimit
          ? getAlmostExceedsLimitTooltip(
              Side.DEPOSIT,
              reserve.config.depositLimit.minus(totalDeposits),
              symbol,
            )
          : almostExceedsDepositLimitUsd
            ? getAlmostExceedsLimitUsd(
                Side.DEPOSIT,
                reserve.config.depositLimitUsd.minus(totalDepositsUsd),
              )
            : undefined;

    const totalBorrowsTooltip = exceedsBorrowLimit
      ? getExceedsLimitTooltip(Side.DEPOSIT)
      : exceedsBorrowLimitUsd
        ? getExceedsLimitUsdTooltip(Side.DEPOSIT)
        : almostExceedsBorrowLimit
          ? getAlmostExceedsLimitTooltip(
              Side.DEPOSIT,
              reserve.config.borrowLimit.minus(totalBorrows),
              symbol,
            )
          : almostExceedsBorrowLimitUsd
            ? getAlmostExceedsLimitUsd(
                Side.DEPOSIT,
                reserve.config.borrowLimitUsd.minus(totalBorrowsUsd),
              )
            : undefined;

    return {
      coinType,
      price,
      symbol,
      iconUrl,
      openLtvPct,
      borrowWeight,
      totalDeposits,
      totalDepositsUsd,
      totalDepositsTooltip,
      totalBorrows,
      totalBorrowsUsd,
      totalBorrowsTooltip,
      depositAprPercent,
      totalDepositAprPercent,
      borrowAprPercent,
      totalBorrowAprPercent,
      rewards,
      reserve,
    };
  }) as ReservesRowData[];

  return (
    <div className="w-full">
      <div className="hidden w-full md:block">
        <DataTable<ReservesRowData>
          columns={columns}
          data={rowData}
          noDataMessage="No assets"
          RowModal={RowModal}
        />
      </div>
      <div className="w-full md:hidden">
        <MarketCardList
          data={rowData}
          noDataMessage="No assets"
          RowModal={RowModal}
        />
      </div>
    </div>
  );
}
