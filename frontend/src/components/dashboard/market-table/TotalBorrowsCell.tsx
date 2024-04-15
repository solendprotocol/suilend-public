import TotalCell from "@/components/dashboard/market-table/TotalCell";
import { ReservesRowData } from "@/components/dashboard/MarketTable";

interface TotalBorrowsCellProps
  extends Pick<
    ReservesRowData,
    | "symbol"
    | "totalBorrows"
    | "totalBorrowsUsd"
    | "totalBorrowsTooltip"
    | "reserve"
  > {
  horizontal?: boolean;
}

export default function TotalBorrowsCell({
  symbol,
  totalBorrows,
  totalBorrowsUsd,
  totalBorrowsTooltip,
  reserve,
  horizontal,
}: TotalBorrowsCellProps) {
  return (
    <TotalCell
      symbol={symbol}
      total={totalBorrows}
      totalUsd={totalBorrowsUsd}
      tooltip={totalBorrowsTooltip}
      reserve={reserve}
      horizontal={horizontal}
    />
  );
}
