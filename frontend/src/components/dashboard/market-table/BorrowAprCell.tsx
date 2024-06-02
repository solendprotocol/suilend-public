import { Side } from "@suilend/sdk/types";

import AprWithRewardsBreakdown from "@/components/dashboard/AprWithRewardsBreakdown";
import { ReservesRowData } from "@/components/dashboard/MarketTable";

type BorrowAprCellProps = Pick<
  ReservesRowData,
  "borrowAprPercent" | "rewards" | "reserve"
>;

export default function BorrowAprCell({
  borrowAprPercent,
  rewards,
  reserve,
}: BorrowAprCellProps) {
  return (
    <AprWithRewardsBreakdown
      side={Side.BORROW}
      aprPercent={borrowAprPercent}
      rewards={rewards?.borrow ?? []}
      reserve={reserve}
    />
  );
}
