import BigNumber from "bignumber.js";
import { ClassValue } from "clsx";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import BorrowLimitTitle from "@/components/dashboard/account/BorrowLimitTitle";
import LiquidationThresholdTitle from "@/components/dashboard/account/LiquidationThresholdTitle";
import WeightedBorrowTitle from "@/components/dashboard/account/WeightedBorrowTitle";
import {
  getPassedBorrowLimit,
  getPassedLiquidationThreshold,
} from "@/components/dashboard/UtilizationBar";
import Collapsible from "@/components/shared/Collapsible";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { formatLtv, formatPrice, formatToken, formatUsd } from "@/lib/format";
import { cn, sortInReserveOrder } from "@/lib/utils";

interface BreakdownColumn {
  title: string;
  data?: string[];
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
      <TLabelSans
        className={cn(
          "h-fit flex-1 text-center",
          rowCount > 0 && "border-b pb-2",
        )}
      >
        {column.title}
      </TLabelSans>
    );
  return (
    <div
      className={cn(
        "flex w-max flex-col gap-1",
        isRightAligned && "justify-end text-right",
      )}
    >
      <TLabelSans className={cn(rowCount > 0 && "mb-1 border-b pb-2")}>
        {column.title}
      </TLabelSans>
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
  totalLabel: string;
  totalValue: string;
  totalValueClassName?: ClassValue;
}

function BreakdownTable({
  rowCount,
  columns,
  totalLabel,
  totalValue,
  totalValueClassName,
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
      <div className="flex w-full flex-row items-center justify-between">
        <TLabelSans>{totalLabel}</TLabelSans>
        <TBody className={cn("text-xs", totalValueClassName)}>
          {totalValue}
        </TBody>
      </div>
    </div>
  );
}

interface ObligationBreakdownProps {
  isBreakdownOpen: boolean;
  setIsBreakdownOpen: (value: boolean) => void;
}

export default function ObligationBreakdown({
  isBreakdownOpen,
  setIsBreakdownOpen,
}: ObligationBreakdownProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const obligation = appContext.obligation as ParsedObligation;

  const sortedDeposits = obligation.deposits
    .slice()
    .sort(sortInReserveOrder(data.lendingMarket.reserves));
  const sortedBorrows = obligation.borrows
    .slice()
    .sort(sortInReserveOrder(data.lendingMarket.reserves));

  const passedBorrowLimit = getPassedBorrowLimit(obligation);
  const passedLiquidationThreshold = getPassedLiquidationThreshold(obligation);

  return (
    <Collapsible
      open={isBreakdownOpen}
      onOpenChange={setIsBreakdownOpen}
      closedTitle="Show breakdown"
      openTitle="Hide breakdown"
      hasSeparator
    >
      <div
        className={cn(
          "flex flex-col items-center gap-6",
          isBreakdownOpen && "-mx-1 mt-6 sm:mx-0",
        )}
      >
        <div className="flex w-full flex-col gap-2">
          <WeightedBorrowTitle />
          <BreakdownTable
            rowCount={sortedBorrows.length}
            columns={[
              {
                title: "Position",
                data: sortedBorrows.map(
                  (b) =>
                    `${formatToken(b.borrowedAmount, { exact: false })} ${b.reserve.symbol}`,
                ),
              },
              { title: "×" },
              {
                title: "Price",
                data: sortedBorrows.map((b) => formatPrice(b.reserve.price)),
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
                      .times(b.reserve.price)
                      .times(b.reserve.config.borrowWeightBps / 10000),
                  ),
                ),
              },
            ]}
            totalLabel="Total weighted borrow"
            totalValue={formatUsd(
              sortedBorrows.reduce(
                (acc, b) =>
                  acc.plus(
                    b.borrowedAmount
                      .times(b.reserve.price)
                      .times(b.reserve.config.borrowWeightBps / 10000),
                  ),
                new BigNumber(0),
              ),
            )}
            totalValueClassName={
              passedBorrowLimit || passedLiquidationThreshold
                ? "text-destructive"
                : "text-foreground"
            }
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <BorrowLimitTitle />
          <BreakdownTable
            rowCount={sortedDeposits.length}
            columns={[
              {
                title: "Position",
                data: sortedDeposits.map(
                  (d) =>
                    `${formatToken(d.depositedAmount, { exact: false })} ${d.reserve.symbol}`,
                ),
              },
              { title: "×" },
              {
                title: "Price",
                data: sortedDeposits.map((d) => formatPrice(d.reserve.price)),
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
                      .times(d.reserve.price)
                      .times(d.reserve.config.openLtvPct / 100),
                  ),
                ),
              },
            ]}
            totalLabel="Total borrow limit"
            totalValue={formatUsd(
              sortedDeposits.reduce(
                (acc, d) =>
                  acc.plus(
                    d.depositedAmount
                      .times(d.reserve.price)
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
                data: sortedDeposits.map(
                  (d) =>
                    `${formatToken(d.depositedAmount, { exact: false })} ${d.reserve.symbol}`,
                ),
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
            totalLabel="Total liquidation threshold"
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
