import { ReservesRowData } from "@/components/dashboard/market-table/MarketTable";
import TotalCell from "@/components/dashboard/market-table/TotalCell";

interface TotalDepositsCellProps
  extends Pick<
    ReservesRowData,
    | "symbol"
    | "totalDeposits"
    | "totalDepositsUsd"
    | "totalDepositsTooltip"
    | "reserve"
  > {
  horizontal?: boolean;
}

export default function TotalDepositsCell({
  symbol,
  totalDeposits,
  totalDepositsUsd,
  totalDepositsTooltip,
  reserve,
  horizontal,
}: TotalDepositsCellProps) {
  return (
    <TotalCell
      symbol={symbol}
      total={totalDeposits}
      totalUsd={totalDepositsUsd}
      tooltip={totalDepositsTooltip}
      reserve={reserve}
      horizontal={horizontal}
    />
  );
}
