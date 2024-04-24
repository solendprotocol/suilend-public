import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import SectionTitle from "@/components/dashboard/account/SectionTitle";
import {
  getPassedBorrowLimit,
  getPassedLiquidationThreshold,
} from "@/components/dashboard/UtilizationBar";
import { useAppContext } from "@/contexts/AppContext";
import { WEIGHTED_BORROW_TOOLTIP } from "@/lib/tooltips";

interface WeightedBorrowTitleProps {
  noTooltip?: boolean;
}

export default function WeightedBorrowTitle({
  noTooltip,
}: WeightedBorrowTitleProps) {
  const appContext = useAppContext();
  const obligation = appContext.obligation as ParsedObligation;

  const passedBorrowLimit = getPassedBorrowLimit(obligation);
  const passedLiquidationThreshold = getPassedLiquidationThreshold(obligation);

  return (
    <SectionTitle
      barSegmentClassName={
        passedBorrowLimit || passedLiquidationThreshold
          ? "bg-destructive"
          : "bg-foreground"
      }
      tooltip={!noTooltip ? WEIGHTED_BORROW_TOOLTIP : undefined}
    >
      Weighted borrow
    </SectionTitle>
  );
}
