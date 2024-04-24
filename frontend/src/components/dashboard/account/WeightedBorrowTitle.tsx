import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import SectionTitle from "@/components/dashboard/account/SectionTitle";
import {
  getPassedBorrowLimit,
  getPassedLiquidationThreshold,
} from "@/components/dashboard/account/UtilizationBar";
import { useAppContext } from "@/contexts/AppContext";
import { WEIGHTED_BORROW_TOOLTIP } from "@/lib/tooltips";

export default function WeightedBorrowTitle() {
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
      tooltip={WEIGHTED_BORROW_TOOLTIP}
    >
      Weighted borrow
    </SectionTitle>
  );
}
