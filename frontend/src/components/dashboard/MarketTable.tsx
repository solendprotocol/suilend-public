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
import { OPEN_LTV_BW_TOOLTIP } from "@/lib/constants";
import { formatToken, formatUsd } from "@/lib/format";
import {
  RewardSummary,
  getFilteredRewards,
  getTotalAprPercent,
} from "@/lib/liquidityMining";

export interface ReservesRowData {
  coinType: string;
  price: BigNumber;
  symbol: string;
  iconUrl?: string;
  openLtvPct: number;
  borrowWeight: number;
  depositedAmount: BigNumber;
  depositedAmountUsd: BigNumber;
  depositedAmountTooltip?: string;
  borrowedAmount: BigNumber;
  borrowedAmountUsd: BigNumber;
  borrowedAmountTooltip?: string;
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
    accessorKey: "depositedAmount",
    sortingFn: decimalSortingFn("depositedAmount"),
    header: ({ column }) =>
      tableHeader(column, "Deposits", { isNumerical: true }),
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
    accessorKey: "borrowedAmount",
    sortingFn: decimalSortingFn("borrowedAmount"),
    header: ({ column }) =>
      tableHeader(column, "Borrows", { isNumerical: true }),
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
    const depositedAmount = reserve.depositedAmount;
    const depositedAmountUsd = reserve.depositedAmountUsd;
    const borrowedAmount = reserve.borrowedAmount;
    const borrowedAmountUsd = reserve.borrowedAmountUsd;
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
      depositedAmount,
    );
    const almostExceedsDepositLimitUsd = getAlmostExceedsLimit(
      reserve.config.depositLimitUsd,
      depositedAmountUsd,
    );

    const exceedsDepositLimit = getExceedsLimit(
      reserve.config.depositLimit,
      depositedAmount,
    );
    const exceedsDepositLimitUsd = getExceedsLimit(
      reserve.config.depositLimitUsd,
      depositedAmountUsd,
    );

    const almostExceedsBorrowLimit = getAlmostExceedsLimit(
      reserve.config.borrowLimit,
      borrowedAmount,
    );
    const almostExceedsBorrowLimitUsd = getAlmostExceedsLimit(
      reserve.config.borrowLimitUsd,
      borrowedAmountUsd,
    );

    const exceedsBorrowLimit = getExceedsLimit(
      reserve.config.borrowLimit,
      borrowedAmount,
    );
    const exceedsBorrowLimitUsd = getExceedsLimit(
      reserve.config.borrowLimitUsd,
      borrowedAmountUsd,
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

    const depositedAmountTooltip = exceedsDepositLimit
      ? getExceedsLimitTooltip(Side.DEPOSIT)
      : exceedsDepositLimitUsd
        ? getExceedsLimitUsdTooltip(Side.DEPOSIT)
        : almostExceedsDepositLimit
          ? getAlmostExceedsLimitTooltip(
              Side.DEPOSIT,
              reserve.config.depositLimit.minus(depositedAmount),
              symbol,
            )
          : almostExceedsDepositLimitUsd
            ? getAlmostExceedsLimitUsd(
                Side.DEPOSIT,
                reserve.config.depositLimitUsd.minus(depositedAmountUsd),
              )
            : undefined;

    const borrowedAmountTooltip = exceedsBorrowLimit
      ? getExceedsLimitTooltip(Side.DEPOSIT)
      : exceedsBorrowLimitUsd
        ? getExceedsLimitUsdTooltip(Side.DEPOSIT)
        : almostExceedsBorrowLimit
          ? getAlmostExceedsLimitTooltip(
              Side.DEPOSIT,
              reserve.config.borrowLimit.minus(borrowedAmount),
              symbol,
            )
          : almostExceedsBorrowLimitUsd
            ? getAlmostExceedsLimitUsd(
                Side.DEPOSIT,
                reserve.config.borrowLimitUsd.minus(borrowedAmountUsd),
              )
            : undefined;

    return {
      coinType,
      price,
      symbol,
      iconUrl,
      openLtvPct,
      borrowWeight,
      depositedAmount,
      depositedAmountUsd,
      depositedAmountTooltip,
      borrowedAmount,
      borrowedAmountUsd,
      borrowedAmountTooltip,
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
