import { ClassValue } from "clsx";

import SectionTitle from "@/components/dashboard/account/SectionTitle";
import { BORROW_LIMIT_TOOLTIP } from "@/lib/tooltips";

interface BorrowLimitTitleProps {
  labelClassName?: ClassValue;
  noTooltip?: boolean;
}

export default function BorrowLimitTitle({
  labelClassName,
  noTooltip,
}: BorrowLimitTitleProps) {
  return (
    <SectionTitle
      barSegmentClassName="bg-primary"
      labelClassName={labelClassName}
      tooltip={!noTooltip ? BORROW_LIMIT_TOOLTIP : undefined}
    >
      Borrow limit
    </SectionTitle>
  );
}
