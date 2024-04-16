import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import { ReservesRowData } from "@/components/dashboard/MarketTable";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabel } from "@/components/shared/Typography";
import { formatToken, formatUsd } from "@/lib/format";
import { cn, hoverUnderlineClassName } from "@/lib/utils";

interface TotalCellProps {
  symbol: ReservesRowData["symbol"];
  total: ReservesRowData["totalDeposits"] | ReservesRowData["totalBorrows"];
  totalUsd:
    | ReservesRowData["totalDepositsUsd"]
    | ReservesRowData["totalBorrowsUsd"];
  tooltip?:
    | ReservesRowData["totalDepositsTooltip"]
    | ReservesRowData["totalBorrowsTooltip"];
  reserve: ParsedReserve;
  horizontal?: boolean;
}
export default function TotalCell({
  symbol,
  total,
  totalUsd,
  tooltip,
  reserve,
  horizontal,
}: TotalCellProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-end gap-1",
        horizontal && "flex-row items-baseline justify-end gap-2",
      )}
    >
      <Tooltip
        title={
          tooltip ??
          `${formatToken(total, { dp: reserve.mintDecimals })} ${symbol}`
        }
      >
        <TBody
          className={cn(
            "text-right",
            !!tooltip &&
              cn(
                "text-muted-foreground decoration-muted-foreground/50",
                hoverUnderlineClassName,
              ),
          )}
        >
          {formatToken(total, { exact: false })} {symbol}
        </TBody>
      </Tooltip>
      <Tooltip title={formatUsd(totalUsd, { exact: true })}>
        <TLabel className="text-right">{formatUsd(totalUsd)}</TLabel>
      </Tooltip>
    </div>
  );
}
