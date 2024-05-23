import { CSSProperties, PropsWithChildren, ReactNode } from "react";

import { ClassValue } from "clsx";

import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import { cn } from "@/lib/utils";

interface SectionTitle extends PropsWithChildren {
  barSegmentClassName?: ClassValue;
  barSegmentStyle?: CSSProperties;
  labelClassName?: ClassValue;
  tooltip?: ReactNode;
}

export default function SectionTitle({
  barSegmentClassName,
  barSegmentStyle,
  labelClassName,
  tooltip,
  children,
}: SectionTitle) {
  return (
    <div className="flex flex-row items-center gap-1.5">
      <div
        className={cn("h-2.5 w-1", barSegmentClassName)}
        style={barSegmentStyle}
      />
      <LabelWithTooltip className={labelClassName} tooltip={tooltip}>
        {children}
      </LabelWithTooltip>
    </div>
  );
}
