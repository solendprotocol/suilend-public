import { PropsWithChildren, ReactNode } from "react";

import { ClassValue } from "clsx";

import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import { cn } from "@/lib/utils";

interface SectionTitle extends PropsWithChildren {
  barSegmentClassName: ClassValue;
  tooltip?: ReactNode;
}

export default function SectionTitle({
  barSegmentClassName,
  tooltip,
  children,
}: SectionTitle) {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className={cn("h-2.5 w-2.5", barSegmentClassName)} />
      <LabelWithTooltip tooltip={tooltip}>{children}</LabelWithTooltip>
    </div>
  );
}
