import SectionTitle from "@/components/dashboard/account/SectionTitle";
import { BORROW_LIMIT_TOOLTIP } from "@/lib/tooltips";

interface BorrowLimitTitleProps {
  noTooltip?: boolean;
}

export default function BorrowLimitTitle({ noTooltip }: BorrowLimitTitleProps) {
  return (
    <SectionTitle
      barSegmentClassName="bg-primary"
      tooltip={!noTooltip ? BORROW_LIMIT_TOOLTIP : undefined}
    >
      Borrow limit
    </SectionTitle>
  );
}
