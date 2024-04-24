import BigNumber from "bignumber.js";

import { ReservesRowData } from "@/components/dashboard/MarketTable";
import { TBody, TLabel } from "@/components/shared/Typography";
import { formatLtv } from "@/lib/format";

export default function OpenLtvBwCell({
  openLtvPct,
  borrowWeight,
}: ReservesRowData) {
  return (
    <div className="flex flex-row items-baseline gap-2">
      <TBody>{formatLtv(new BigNumber(openLtvPct))}</TBody>
      <TLabel>/</TLabel>
      <TBody>{borrowWeight}</TBody>
    </div>
  );
}
