import TotalCell from "@/components/dashboard/market-table/TotalCell";
import { ReservesRowData } from "@/components/dashboard/MarketTable";

type TotalBorrowsCellProps = Pick<
  ReservesRowData,
  | "symbol"
  | "borrowedAmount"
  | "borrowedAmountUsd"
  | "borrowedAmountTooltip"
  | "reserve"
> & {
  horizontal?: boolean;
};

export default function TotalBorrowsCell({
  symbol,
  borrowedAmount,
  borrowedAmountUsd,
  borrowedAmountTooltip,
  reserve,
  horizontal,
}: TotalBorrowsCellProps) {
  return (
    <TotalCell
      symbol={symbol}
      total={borrowedAmount}
      totalUsd={borrowedAmountUsd}
      tooltip={borrowedAmountTooltip}
      reserve={reserve}
      horizontal={horizontal}
    />
  );
}
