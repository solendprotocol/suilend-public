import { Side } from "@suilend/sdk/types";

import AprWithRewardsBreakdown from "@/components/dashboard/AprWithRewardsBreakdown";
import { ReservesRowData } from "@/components/dashboard/market-table/MarketTable";

export default function DepositAprCell({
  depositAprPercent,
  rewards,
}: ReservesRowData) {
  return (
    <AprWithRewardsBreakdown
      side={Side.DEPOSIT}
      aprPercent={depositAprPercent}
      rewards={rewards?.deposit ?? []}
    />
  );
}
