import { Side } from "@suilend/sdk/types";

import AprWithRewardsBreakdown from "@/components/dashboard/AprWithRewardsBreakdown";
import { ReservesRowData } from "@/components/dashboard/MarketTable";

export default function BorrowAprCell({
  borrowAprPercent,
  rewards,
}: ReservesRowData) {
  return (
    <AprWithRewardsBreakdown
      side={Side.BORROW}
      aprPercent={borrowAprPercent}
      rewards={rewards?.borrow ?? []}
    />
  );
}
