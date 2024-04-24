import SectionTitle from "@/components/dashboard/account/SectionTitle";
import { LIQUIDATION_THRESHOLD_TOOLTIP } from "@/lib/tooltips";

interface LiquidationThresholdTitleProps {
  noTooltip?: boolean;
}

export default function LiquidationThresholdTitle({
  noTooltip,
}: LiquidationThresholdTitleProps) {
  return (
    <SectionTitle
      barSegmentClassName="bg-secondary"
      tooltip={!noTooltip ? LIQUIDATION_THRESHOLD_TOOLTIP : undefined}
    >
      Liquidation threshold
    </SectionTitle>
  );
}
