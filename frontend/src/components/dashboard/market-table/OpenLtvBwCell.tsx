import BigNumber from "bignumber.js";

import { ReservesRowData } from "@/components/dashboard/MarketTable";
import { TBody, TLabel } from "@/components/shared/Typography";
import { formatBorrowWeight, formatLtvPercent } from "@/lib/format";

export default function OpenLtvBwCell({
  openLtvPercent,
  borrowWeight,
}: ReservesRowData) {
  return (
    <div className="flex flex-row items-center gap-2">
      <TBody>{formatLtvPercent(new BigNumber(openLtvPercent))}</TBody>
      <TLabel>/</TLabel>
      <TBody>{formatBorrowWeight(borrowWeight)}</TBody>
    </div>
  );
}
