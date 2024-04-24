import React from "react";

import BigNumber from "bignumber.js";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import Tooltip from "@/components/shared/Tooltip";
import { TBody } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export const getBorrowLimitUsd = (obligation: ParsedObligation) =>
  obligation.minPriceBorrowLimitUsd;

export const getWeightedBorrowsUsd = (obligation: ParsedObligation) => {
  return obligation.maxPriceTotalWeightedBorrowUsd.gt(
    getBorrowLimitUsd(obligation),
  )
    ? BigNumber.max(
        obligation.totalWeightedBorrowUsd,
        getBorrowLimitUsd(obligation),
      )
    : obligation.maxPriceTotalWeightedBorrowUsd;
};

export const getPassedBorrowLimit = (obligation: ParsedObligation) => {
  const weightedBorrowsUsd = getWeightedBorrowsUsd(obligation);
  const borrowLimitUsd = getBorrowLimitUsd(obligation);

  return weightedBorrowsUsd.gte(borrowLimitUsd);
};

export const getPassedLiquidationThreshold = (obligation: ParsedObligation) => {
  const weightedBorrowsUsd = getWeightedBorrowsUsd(obligation);
  const liquidationThreshold = obligation.unhealthyBorrowValueUsd;

  return weightedBorrowsUsd.gte(liquidationThreshold);
};

interface SegmentProps {
  className?: string;
  widthPercent: number;
}

function Segment({ className, widthPercent }: SegmentProps) {
  if (widthPercent === 0) return null;
  return (
    <div
      className={cn("relative z-[1] h-full bg-muted/20", className)}
      style={{ width: `${widthPercent}%` }}
    />
  );
}

interface ThresholdProps {
  className?: string;
  leftPercent: number;
}

function Threshold({ className, leftPercent }: ThresholdProps) {
  return (
    <div
      className={cn(
        "absolute bottom-0 top-0 z-[2] w-1 -translate-x-2/4",
        className,
      )}
      style={{ left: `${leftPercent}%` }}
    />
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

  const depositedAmountUsd = obligation.totalSupplyUsd;
  if (depositedAmountUsd.eq(0)) return null;

  const weightedBorrowsUsd = getWeightedBorrowsUsd(obligation);
  const borrowLimitUsd = getBorrowLimitUsd(obligation);
  const liquidationThresholdUsd = obligation.unhealthyBorrowValueUsd;

  const passedBorrowLimit = getPassedBorrowLimit(obligation);
  const passedLiquidationThreshold = getPassedLiquidationThreshold(obligation);

  const toPercent = (value: BigNumber) =>
    value.div(depositedAmountUsd).times(100).toNumber();

  const segments = (() => {
    if (!passedBorrowLimit) {
      return [
        {
          widthPercent: toPercent(weightedBorrowsUsd),
          className: "bg-foreground shadow-0foreground",
        },
        {
          widthPercent: toPercent(
            new BigNumber(borrowLimitUsd.minus(weightedBorrowsUsd)),
          ),
        },
        {
          widthPercent: toPercent(
            new BigNumber(liquidationThresholdUsd.minus(borrowLimitUsd)),
          ),
        },
        {
          widthPercent: toPercent(
            new BigNumber(depositedAmountUsd.minus(liquidationThresholdUsd)),
          ),
        },
      ];
    } else if (!passedLiquidationThreshold) {
      return [
        {
          widthPercent: toPercent(weightedBorrowsUsd),
          className: "bg-destructive shadow-0destructive",
        },
        {
          widthPercent: toPercent(
            new BigNumber(liquidationThresholdUsd.minus(weightedBorrowsUsd)),
          ),
        },
        {
          widthPercent: toPercent(
            new BigNumber(depositedAmountUsd.minus(liquidationThresholdUsd)),
          ),
        },
      ];
    } else {
      return [
        {
          widthPercent: toPercent(weightedBorrowsUsd),
          className: "bg-destructive shadow-0destructive",
        },
        {
          widthPercent: toPercent(
            new BigNumber(depositedAmountUsd.minus(weightedBorrowsUsd)),
          ),
        },
      ];
    }
  })();

  const thresholds = [
    {
      leftPercent: toPercent(borrowLimitUsd),
      className: "bg-primary shadow-0primary",
    },
    {
      leftPercent: toPercent(liquidationThresholdUsd),
      className: "bg-secondary shadow-0secondary",
    },
  ];

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
    <Tooltip
      contentProps={{
        className: "px-4 py-4 flex-col flex gap-4",
      }}
      content={
        <>
          <TBody>Hi</TBody>
        </>
      }
    >
      <div
        className="relative flex h-2.5 w-full cursor-pointer flex-row"
        onClick={onClick}
      >
        {segments.map((segment, index) => (
          <Segment
            key={index}
            className={segment.className}
            widthPercent={segment.widthPercent}
          />
        ))}
        {thresholds.map((threshold, index) => (
          <Threshold
            key={index}
            className={threshold.className}
            leftPercent={threshold.leftPercent}
          />
        ))}
      </div>
    </Tooltip>
  );
}
