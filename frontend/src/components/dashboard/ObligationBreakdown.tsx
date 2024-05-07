import { CSSProperties, ReactNode } from "react";

import BigNumber from "bignumber.js";
import { ClassValue } from "clsx";
import { useLocalStorage } from "usehooks-ts";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import BorrowLimitTitle from "@/components/dashboard/account/BorrowLimitTitle";
import LiquidationThresholdTitle from "@/components/dashboard/account/LiquidationThresholdTitle";
import WeightedBorrowsTitle from "@/components/dashboard/account/WeightedBorrowsTitle";
import { getWeightedBorrowsColor } from "@/components/dashboard/UtilizationBar";
import Collapsible from "@/components/shared/Collapsible";
import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import { TBody } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { formatLtv, formatPrice, formatToken, formatUsd } from "@/lib/format";
import {
  BORROW_LIMIT_PRICE_TOOLTIP,
  WEIGHTED_BORROWS_PRICE_TOOLTIP,
} from "@/lib/tooltips";
import { cn, sortInReserveOrder } from "@/lib/utils";

interface BreakdownColumn {
  title: string;
  titleTooltip?: string | ReactNode;
  data?: (string | ReactNode)[];
}

interface BreakdownColumnProps {
  column: BreakdownColumn;
  rowCount: number;
  isRightAligned?: boolean;
}

function BreakdownColumn({
  column,
  rowCount,
  isRightAligned,
}: BreakdownColumnProps) {
  if (!column.data)
    return (
      <LabelWithTooltip
        className={cn(
          "h-fit w-auto flex-1 text-center",
          rowCount > 0 && "border-b pb-2",
        )}
        tooltip={column.titleTooltip}
      >
        {column.title}
      </LabelWithTooltip>
    );
  return (
    <div
      className={cn(
        "flex w-max flex-col gap-1",
        isRightAligned && "justify-end text-right",
      )}
    >
      <LabelWithTooltip
        className={cn("w-auto", rowCount > 0 && "mb-1 border-b pb-2")}
        tooltip={column.titleTooltip}
      >
        {column.title}
      </LabelWithTooltip>
      {column.data.map((row, index) => (
        <TBody key={index} className="text-xs">
          {row}
        </TBody>
      ))}
    </div>
  );
}

interface BreakdownTableProps {
  rowCount: number;
  columns: BreakdownColumn[];
  totalValue: string | ReactNode;
  totalValueClassName?: ClassValue;
  totalValueStyle?: CSSProperties;
}

function BreakdownTable({
  rowCount,
  columns,
  totalValue,
  totalValueClassName,
  totalValueStyle,
}: BreakdownTableProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Separator className="w-full" />
      <div className="flex w-full flex-row">
        {columns.map((column, index) => (
          <BreakdownColumn
            key={index}
            column={column}
            rowCount={rowCount}
            isRightAligned={index !== 0}
          />
        ))}
      </div>
      <Separator className="w-full" />
      <div className="flex w-full flex-row justify-end">
        <TBody
          className={cn("text-xs", totalValueClassName)}
          style={totalValueStyle}
        >
          {totalValue}
        </TBody>
      </div>
    </div>
  );
}

export default function ObligationBreakdown() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const obligation = appContext.obligation as ParsedObligation;

  const sortedDeposits = obligation.deposits
    .slice()
    .sort(sortInReserveOrder(data.lendingMarket.reserves));
  const sortedBorrows = obligation.borrows
    .slice()
    .sort(sortInReserveOrder(data.lendingMarket.reserves));

  // State
  const [isOpen, setIsOpen] = useLocalStorage<boolean>(
    "isPositionBreakdownOpen",
    false,
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      closedTitle="Show breakdown"
      openTitle="Hide breakdown"
      hasSeparator
    >
      <div className={cn("flex flex-col items-center gap-4", isOpen && "mt-6")}>
        <div className="flex w-full flex-col gap-2">
          <WeightedBorrowsTitle />
          <BreakdownTable
            rowCount={sortedBorrows.length}
            columns={[
              {
                title: "Position",
                data: sortedBorrows.map((b) => (
                  <>
                    {formatToken(b.borrowedAmount, { exact: false })}{" "}
                    {b.reserve.symbol}
                  </>
                )),
              },
              { title: "×" },
              {
                title: "Price",
                titleTooltip: WEIGHTED_BORROWS_PRICE_TOOLTIP,
                data: sortedBorrows.map((b) => formatPrice(b.reserve.maxPrice)),
              },
              { title: "×" },
              {
                title: "Weight",
                data: sortedBorrows.map((b) =>
                  (b.reserve.config.borrowWeightBps / 10000).toString(),
                ),
              },
              { title: "=" },
              {
                title: "Total",
                data: sortedBorrows.map((b) =>
                  formatUsd(
                    b.borrowedAmount
                      .times(b.reserve.maxPrice)
                      .times(b.reserve.config.borrowWeightBps / 10000),
                  ),
                ),
              },
            ]}
            totalValue={formatUsd(
              sortedBorrows.reduce(
                (acc, b) =>
                  acc.plus(
                    b.borrowedAmount
                      .times(b.reserve.maxPrice)
                      .times(b.reserve.config.borrowWeightBps / 10000),
                  ),
                new BigNumber(0),
              ),
            )}
            totalValueStyle={{
              color: `hsl(var(--${getWeightedBorrowsColor(obligation)}))`,
            }}
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <BorrowLimitTitle />
          <BreakdownTable
            rowCount={sortedDeposits.length}
            columns={[
              {
                title: "Position",
                data: sortedDeposits.map((d) => (
                  <>
                    {formatToken(d.depositedAmount, { exact: false })}{" "}
                    {d.reserve.symbol}
                  </>
                )),
              },
              { title: "×" },
              {
                title: "Price",
                titleTooltip: BORROW_LIMIT_PRICE_TOOLTIP,
                data: sortedDeposits.map((d) =>
                  formatPrice(d.reserve.minPrice),
                ),
              },
              { title: "×" },
              {
                title: "Open LTV",
                data: sortedDeposits.map((d) =>
                  formatLtv(new BigNumber(d.reserve.config.openLtvPct)),
                ),
              },
              { title: "=" },
              {
                title: "Total",
                data: sortedDeposits.map((d) =>
                  formatUsd(
                    d.depositedAmount
                      .times(d.reserve.minPrice)
                      .times(d.reserve.config.openLtvPct / 100),
                  ),
                ),
              },
            ]}
            totalValue={formatUsd(
              sortedDeposits.reduce(
                (acc, d) =>
                  acc.plus(
                    d.depositedAmount
                      .times(d.reserve.minPrice)
                      .times(d.reserve.config.openLtvPct / 100),
                  ),
                new BigNumber(0),
              ),
            )}
            totalValueClassName="text-primary"
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <LiquidationThresholdTitle />
          <BreakdownTable
            rowCount={sortedDeposits.length}
            columns={[
              {
                title: "Position",
                data: sortedDeposits.map((d) => (
                  <>
                    {formatToken(d.depositedAmount, { exact: false })}{" "}
                    {d.reserve.symbol}
                  </>
                )),
              },
              { title: "×" },
              {
                title: "Price",
                data: sortedDeposits.map((d) => formatPrice(d.reserve.price)),
              },
              { title: "×" },
              {
                title: "Close LTV",
                data: sortedDeposits.map((d) =>
                  formatLtv(new BigNumber(d.reserve.config.closeLtvPct)),
                ),
              },
              { title: "=" },
              {
                title: "Total",
                data: sortedDeposits.map((d) =>
                  formatUsd(
                    d.depositedAmount
                      .times(d.reserve.price)
                      .times(d.reserve.config.closeLtvPct / 100),
                  ),
                ),
              },
            ]}
            totalValue={formatUsd(
              sortedDeposits.reduce(
                (acc, d) =>
                  acc.plus(
                    d.depositedAmount
                      .times(d.reserve.price)
                      .times(d.reserve.config.closeLtvPct / 100),
                  ),
                new BigNumber(0),
              ),
            )}
            totalValueClassName="text-secondary"
          />
        </div>
      </div>
    </Collapsible>
  );
}
