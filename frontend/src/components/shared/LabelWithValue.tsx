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
  valueStartDecorator?: ReactNode;
  value: string | number | BigNumber;
  valueEndDecorator?: ReactNode;
  isId?: boolean;
  isType?: boolean;
  isUsd?: boolean;
  url?: string;
  urlTooltip?: string;
  isExplorerUrl?: boolean;
  horizontal?: boolean;
  monoLabel?: boolean;
  customChild?: ReactNode;
}

export default function LabelWithValue({
  className,
  label,
  labelTooltip,
  valueStartDecorator,
  value,
  valueEndDecorator,
  isId,
  isType,
  isUsd,
  url,
  urlTooltip,
  isExplorerUrl,
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
          valueStartDecorator={valueStartDecorator}
          value={value}
          valueEndDecorator={valueEndDecorator}
          isId={isId}
          isType={isType}
          isUsd={isUsd}
          url={url}
          urlTooltip={urlTooltip}
          isExplorerUrl={isExplorerUrl}
        />
      )}
    </div>
  );
}
