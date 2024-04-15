import { ReactNode } from "react";

import BigNumber from "bignumber.js";
import { ClassValue } from "clsx";

import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import Value from "@/components/shared/Value";
import { cn } from "@/lib/utils";

interface LabelWithValueProps {
  className?: ClassValue;
  label: string;
  labelTooltip?: string;
  value: string | number | BigNumber;
  url?: string;
  isId?: boolean;
  isType?: boolean;
  isUsd?: boolean;
  horizontal?: boolean;
  monoLabel?: boolean;
  customChild?: ReactNode;
}

export default function LabelWithValue({
  className,
  label,
  labelTooltip,
  value,
  url,
  isId,
  isType,
  isUsd,
  horizontal,
  monoLabel,
  customChild,
}: LabelWithValueProps) {
  return (
    <div
      className={cn(
        "flex w-full justify-between",
        className,
        horizontal ? "flex-row items-center gap-2" : "h-min flex-col gap-1",
      )}
    >
      <LabelWithTooltip tooltip={labelTooltip} isMono={monoLabel}>
        {label}
      </LabelWithTooltip>

      {customChild ?? (
        <Value
          value={value}
          url={url}
          isId={isId}
          isType={isType}
          isUsd={isUsd}
        />
      )}
    </div>
  );
}
