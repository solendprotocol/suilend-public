import SectionTitle from "@/components/dashboard/account/SectionTitle";
import { BORROW_LIMIT_TOOLTIP } from "@/lib/tooltips";

export default function BorrowLimitTitle() {
  return (
    <SectionTitle
      barSegmentClassName="bg-primary"
      tooltip={BORROW_LIMIT_TOOLTIP}
    >
      Borrow limit
    </SectionTitle>
  );
}
