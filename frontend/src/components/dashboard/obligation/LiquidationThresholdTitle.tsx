import SectionTitle from "@/components/dashboard/obligation/SectionTitle";
import { LIQUIDATION_THRESHOLD_TOOLTIP } from "@/lib/tooltips";

export default function LiquidationThresholdTitle() {
  return (
    <SectionTitle
      barSegmentClassName="bg-secondary"
      tooltip={LIQUIDATION_THRESHOLD_TOOLTIP}
    >
      Liquidation threshold
    </SectionTitle>
  );
}
