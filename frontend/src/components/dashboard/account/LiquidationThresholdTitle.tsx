import { ClassValue } from "clsx";

import SectionTitle from "@/components/dashboard/account/SectionTitle";
import { LIQUIDATION_THRESHOLD_TOOLTIP } from "@/lib/tooltips";

interface LiquidationThresholdTitleProps {
  labelClassName?: ClassValue;
  noTooltip?: boolean;
}

export default function LiquidationThresholdTitle({
  labelClassName,
  noTooltip,
}: LiquidationThresholdTitleProps) {
  return (
    <SectionTitle
      barSegmentClassName="bg-secondary"
      labelClassName={labelClassName}
      tooltip={!noTooltip ? LIQUIDATION_THRESHOLD_TOOLTIP : undefined}
    >
      Liquidation threshold
    </SectionTitle>
  );
}
