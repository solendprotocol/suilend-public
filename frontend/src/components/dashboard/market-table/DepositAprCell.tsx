import { Side } from "@suilend/sdk/types";

import AprWithRewardsBreakdown from "@/components/dashboard/AprWithRewardsBreakdown";
import { ReservesRowData } from "@/components/dashboard/MarketTable";

type DepositAprCellProps = Pick<
  ReservesRowData,
  "depositAprPercent" | "rewards" | "reserve"
>;

export default function DepositAprCell({
  depositAprPercent,
  rewards,
  reserve,
}: DepositAprCellProps) {
  return (
    <AprWithRewardsBreakdown
      side={Side.DEPOSIT}
      aprPercent={depositAprPercent}
      rewards={rewards?.deposit ?? []}
      reserve={reserve}
    />
  );
}
