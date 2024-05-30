import TotalCell from "@/components/dashboard/market-table/TotalCell";
import { ReservesRowData } from "@/components/dashboard/MarketTable";

type TotalDepositsCellProps = Pick<
  ReservesRowData,
  | "symbol"
  | "depositedAmount"
  | "depositedAmountUsd"
  | "depositedAmountTooltip"
  | "reserve"
> & {
  horizontal?: boolean;
};

export default function TotalDepositsCell({
  symbol,
  depositedAmount,
  depositedAmountUsd,
  depositedAmountTooltip,
  reserve,
  horizontal,
}: TotalDepositsCellProps) {
  return (
    <TotalCell
      symbol={symbol}
      total={depositedAmount}
      totalUsd={depositedAmountUsd}
      tooltip={depositedAmountTooltip}
      reserve={reserve}
      horizontal={horizontal}
    />
  );
}
