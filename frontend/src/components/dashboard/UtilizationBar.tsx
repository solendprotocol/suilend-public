import React from "react";

import BigNumber from "bignumber.js";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import Tooltip from "@/components/shared/Tooltip";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

const BAR_WIDTH_PERCENT = 1.5;

export const getPassedBorrowLimit = (obligation: ParsedObligation) => {
  const weightedBorrowUsd = obligation.maxPriceTotalWeightedBorrowUsd;
  const borrowLimitUsd = obligation.minPriceBorrowLimit;

  return weightedBorrowUsd.gte(borrowLimitUsd);
};

export const getPassedLiquidationThreshold = (obligation: ParsedObligation) => {
  const weightedBorrowUsd = obligation.maxPriceTotalWeightedBorrowUsd;
  const liquidationThreshold = obligation.unhealthyBorrowValueUsd;

  return weightedBorrowUsd.gte(liquidationThreshold);
};

interface SectionProps {
  className?: string;
  widthPercent?: number;
  tooltip?: string;
}

function Section({ className, widthPercent, tooltip }: SectionProps) {
  if (widthPercent === 0) return null;
  return (
    <Tooltip title={tooltip}>
      <div
        className={cn("h-full bg-muted/20", className)}
        style={{ width: `${widthPercent ?? BAR_WIDTH_PERCENT}%` }}
      />
    </Tooltip>
  );
}

interface UtilizationBarProps {
  obligation?: ParsedObligation | null;
  onClick?: () => void;
}

export default function UtilizationBar({
  obligation,
  onClick,
}: UtilizationBarProps) {
  const appContext = useAppContext();

  if (!obligation) obligation = appContext.obligation;
  if (!obligation) return null;

  const supply = obligation.totalSupplyUsd;
  if (supply.eq(0)) return null;

  const weightedBorrowUsd = obligation.maxPriceTotalWeightedBorrowUsd;
  const borrowLimitUsd = obligation.minPriceBorrowLimit;
  const liquidationThreshold = obligation.unhealthyBorrowValueUsd;

  const passedBorrowLimit = getPassedBorrowLimit(obligation);
  const passedLiquidationThreshold =
    weightedBorrowUsd.gte(liquidationThreshold);

  const getBars = () => {
    if (!passedBorrowLimit) {
      const barPercent = 100 - BAR_WIDTH_PERCENT * 2;

      return [
        {
          widthPercent: weightedBorrowUsd
            .div(supply)
            .times(barPercent)
            .toNumber(),
          className: "bg-foreground shadow-0foreground",
        },
        {
          widthPercent: new BigNumber(borrowLimitUsd.minus(weightedBorrowUsd))
            .div(supply)
            .times(barPercent)
            .toNumber(),
        },
        { className: "bg-primary shadow-0primary" },
        {
          widthPercent: new BigNumber(
            liquidationThreshold.minus(borrowLimitUsd),
          )
            .div(supply)
            .times(barPercent)
            .toNumber(),
        },
        { className: "bg-secondary shadow-0secondary" },
        {
          widthPercent: new BigNumber(supply.minus(liquidationThreshold))
            .div(supply)
            .times(barPercent)
            .toNumber(),
        },
      ];
    } else if (!passedLiquidationThreshold) {
      const barPercent = 100 - BAR_WIDTH_PERCENT * 1;

      return [
        {
          widthPercent: weightedBorrowUsd
            .div(supply)
            .times(barPercent)
            .toNumber(),
          className: "bg-destructive shadow-0destructive",
        },
        {
          widthPercent: new BigNumber(
            liquidationThreshold.minus(weightedBorrowUsd),
          )
            .div(supply)
            .times(barPercent)
            .toNumber(),
        },
        { className: "bg-secondary shadow-0secondary" },
        {
          widthPercent: new BigNumber(supply.minus(liquidationThreshold))
            .div(supply)
            .times(barPercent)
            .toNumber(),
        },
      ];
    } else {
      const barPercent = 100 - BAR_WIDTH_PERCENT * 0;

      return [
        {
          widthPercent: liquidationThreshold
            .div(supply)
            .times(barPercent)
            .toNumber(),
          className: "bg-destructive shadow-0destructive",
        },
        {
          widthPercent: new BigNumber(supply.minus(liquidationThreshold))
            .div(supply)
            .times(barPercent)
            .toNumber(),
        },
      ];
    }
  };

  // const weightedBorrowUtilization = obligation.minPriceBorrowLimit.isZero()
  //   ? new BigNumber("0")
  //   : obligation.totalWeightedBorrowUsd.div(obligation.borrowLimit).times(100);

  // const liquidationThresholdFactor = obligation.totalSupplyUsd.isZero()
  //   ? new BigNumber("0")
  //   : obligation.unhealthyBorrowValueUsd
  //       .div(obligation.totalSupplyUsd)
  //       .times(100);

  // const borrowLimitOverSupply = obligation.totalSupplyUsd.isZero()
  //   ? new BigNumber("0")
  //   : obligation.minPriceBorrowLimit.div(obligation.totalSupplyUsd).times(100);

  // // Tooltips
  // let borrowToolTip = `Your weighted borrow is ${formatPercent(
  //   weightedBorrowUsd,
  // )} of your total deposited balance, or ${formatPercent(
  //   weightedBorrowUtilization,
  // )} of your borrow limit.`;

  // if (passedLimit) {
  //   borrowToolTip =
  //     "Your weighted borrow balance is past the borrow limit and could be at risk of liquidation. Please repay your borrows or deposit more assets.";
  // }
  // if (passedThreshold) {
  //   borrowToolTip =
  //     "Your weighted borrow balance is past the liquidation threshold and could be liquidated.";
  // }

  // const unweightedBorrowTooltip =
  //   "This portion represents the actual value of your borrows. However, certain assets have a borrow weight that changes their value during liquidation or borrow limit calculations.";

  return (
    <div
      className="flex h-2.5 w-full cursor-pointer flex-row"
      onClick={onClick}
    >
      {getBars().map((bar, index) => (
        <Section
          key={index}
          className={bar.className}
          widthPercent={bar.widthPercent}
        />
      ))}
    </div>
  );
}
