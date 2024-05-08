import { Side } from "@suilend/sdk/types";

import AprWithRewardsBreakdown from "@/components/dashboard/AprWithRewardsBreakdown";
import { ReservesRowData } from "@/components/dashboard/MarketTable";

export default function DepositAprCell({
  depositAprPercent,
  rewards,
  reserve,
}: ReservesRowData) {
  return (
    <AprWithRewardsBreakdown
      side={Side.DEPOSIT}
      aprPercent={depositAprPercent}
      rewards={rewards?.deposit ?? []}
      reserve={reserve}
    />
  );
}
