import React from "react";

import BigNumber from "bignumber.js";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import Tooltip from "@/components/shared/Tooltip";
import { useAppContext } from "@/contexts/AppContext";
import { formatPercent, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

const BAR_WIDTH = 1.5;

const getUsedBorrowValue = (obligation: ParsedObligation) => {
  const isLiquiable = obligation.totalWeightedBorrowUsd.gte(
    obligation.unhealthyBorrowValueUsd,
  );

  return isLiquiable
    ? obligation.maxPriceTotalWeightedBorrowUsd
    : BigNumber.min(
        obligation.unhealthyBorrowValueUsd,
        obligation.maxPriceTotalWeightedBorrowUsd,
      );
};

export const getPassedLimit = (obligation: ParsedObligation) => {
  const usedBorrowValue = getUsedBorrowValue(obligation);

  return (
    obligation.totalSupplyUsd.isZero() ||
    (!usedBorrowValue.isZero() &&
      usedBorrowValue.gte(obligation.minPriceBorrowLimit))
  );
};

interface SectionProps {
  width?: number;
  className?: string;
  tooltip?: string;
}

function Section({ width, className, tooltip }: SectionProps) {
  if (width === 0) return null;
  return (
    <Tooltip title={tooltip}>
      <div
        className={cn("h-full bg-muted/20", className)}
        style={{ width: `${width || BAR_WIDTH}%` }}
      />
    </Tooltip>
  );
}

interface UtilizationBarProps {
  obligation?: ParsedObligation | null;
  isBreakdownOpen?: boolean;
  onClick?: () => void;
}

export default function UtilizationBar({
  obligation,
  isBreakdownOpen,
  onClick,
}: UtilizationBarProps) {
  const appContext = useAppContext();

  if (!obligation) obligation = appContext.obligation;
  if (!obligation) return null;

  const usedBorrowValue = getUsedBorrowValue(obligation);

  const weightedBorrowOverSupply = obligation.totalSupplyUsd.isZero()
    ? new BigNumber(0)
    : obligation.totalWeightedBorrowUsd.div(obligation.totalSupplyUsd);

  const borrowOverSupply = obligation.totalSupplyUsd.isZero()
    ? new BigNumber(0)
    : usedBorrowValue.div(obligation.totalSupplyUsd);

  const passedLimit = getPassedLimit(obligation);
  const passedThreshold =
    obligation.totalSupplyUsd.isZero() ||
    (!usedBorrowValue.isZero() &&
      usedBorrowValue.gte(obligation.unhealthyBorrowValueUsd));

  // Reserve space for the bars
  const denominator =
    100 -
    2 * BAR_WIDTH +
    (passedLimit ? BAR_WIDTH : 0) +
    (passedThreshold ? BAR_WIDTH : 0);

  const borrowWidth = Math.min(
    100,
    Number(Number(borrowOverSupply.toString()).toFixed(4)) * denominator,
  );

  const weightedBorrowWidth =
    Math.min(
      100,
      Number(Number(weightedBorrowOverSupply.toString()).toFixed(4)) *
        denominator,
    ) - borrowWidth;

  const totalBorrowWidth = borrowWidth + weightedBorrowWidth;

  const unborrowedWidth =
    Number(
      Number(
        obligation.totalSupplyUsd.isZero()
          ? new BigNumber(0)
          : BigNumber.max(
              obligation.minPriceBorrowLimit.minus(usedBorrowValue),
              new BigNumber(0),
            )
              .div(obligation.totalSupplyUsd)
              .toString(),
      ).toFixed(4),
    ) * denominator;
  const unliquidatedWidth =
    Number(
      Number(
        obligation.totalSupplyUsd.isZero()
          ? new BigNumber(0)
          : BigNumber.max(
              obligation.unhealthyBorrowValueUsd.minus(
                BigNumber.max(obligation.minPriceBorrowLimit, usedBorrowValue),
              ),
              new BigNumber(0),
            )
              .div(obligation.totalSupplyUsd)
              .toString(),
      ).toFixed(4),
    ) * denominator;
  const unusedSupply =
    denominator - totalBorrowWidth - unborrowedWidth - unliquidatedWidth;

  const weightedBorrowUtilization = obligation.minPriceBorrowLimit.isZero()
    ? new BigNumber("0")
    : obligation.totalWeightedBorrowUsd.div(obligation.borrowLimit).times(100);

  const liquidationThresholdFactor = obligation.totalSupplyUsd.isZero()
    ? new BigNumber("0")
    : obligation.unhealthyBorrowValueUsd
        .div(obligation.totalSupplyUsd)
        .times(100);

  const borrowLimitOverSupply = obligation.totalSupplyUsd.isZero()
    ? new BigNumber("0")
    : obligation.minPriceBorrowLimit.div(obligation.totalSupplyUsd).times(100);

  // Tooltips
  let borrowToolTip = `Your weighted borrow balance is ${formatPercent(
    weightedBorrowOverSupply.times(100),
  )} of your total deposited balance, or ${formatPercent(
    weightedBorrowUtilization,
  )} of your borrow limit.`;

  if (passedLimit) {
    borrowToolTip =
      "Your weighted borrow balance is past the borrow limit and could be at risk of liquidation. Please repay your borrows or deposit more assets.";
  }
  if (passedThreshold) {
    borrowToolTip =
      "Your weighted borrow balance is past the liquidation threshold and could be liquidated.";
  }

  const unweightedBorrowTooltip =
    "This portion represents the actual value of your borrows. However, certain assets have a borrow weight that changes their value during liquidation or borrow limit calculations.";

  return (
    <div
      className="flex h-2.5 w-full cursor-pointer flex-row"
      onClick={onClick}
    >
      {isBreakdownOpen ? (
        <>
          <Section
            width={borrowWidth}
            className={
              passedLimit
                ? "bg-destructive shadow-0destructive"
                : "bg-foreground/50 shadow-0foreground"
            }
            tooltip={borrowToolTip}
          />
          <Section
            width={weightedBorrowWidth}
            className={
              passedLimit
                ? "bg-destructive shadow-0destructive"
                : "bg-foreground shadow-0foreground"
            }
            tooltip={unweightedBorrowTooltip}
          />
        </>
      ) : (
        <Section
          width={totalBorrowWidth}
          className={
            passedLimit
              ? "bg-destructive shadow-0destructive"
              : "bg-foreground shadow-0foreground"
          }
          tooltip={borrowToolTip}
        />
      )}
      {!passedLimit && (
        <>
          <Section
            width={unborrowedWidth}
            tooltip={`You can borrow ${formatUsd(
              obligation.minPriceBorrowLimit.minus(usedBorrowValue),
            )} more (weighted) borrow value before you hit your limit.`}
          />
          <Section
            className="bg-primary shadow-0primary"
            tooltip={`Your borrow limit is at ${formatUsd(
              obligation.minPriceBorrowLimit,
            )} and is ${formatPercent(
              borrowLimitOverSupply,
            )} of your deposited balance.`}
          />
        </>
      )}
      <Section
        width={unliquidatedWidth}
        tooltip="Once you hit your borrow limit, you could be dangerously close to liquidation."
      />
      {!passedThreshold && (
        <Section
          className="bg-secondary shadow-0secondary"
          tooltip={`Your liquidation threshold is at ${formatUsd(
            obligation.unhealthyBorrowValueUsd,
          )} and is ${formatPercent(
            liquidationThresholdFactor,
          )} of your deposited balance.`}
        />
      )}
      <Section
        width={unusedSupply}
        tooltip="Deposit more assets to increase your borrow limit and your liquidation threshold."
      />
    </div>
  );
}
