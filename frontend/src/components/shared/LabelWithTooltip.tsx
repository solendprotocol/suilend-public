import { PropsWithChildren, ReactNode } from "react";

import { ClassValue } from "clsx";

import Tooltip, { TooltipProps } from "@/components/shared/Tooltip";
import { TLabel, TLabelSans } from "@/components/shared/Typography";
import { cn, hoverUnderlineClassName } from "@/lib/utils";

interface LabelProps extends PropsWithChildren {
  className?: ClassValue;
  tooltip?: string | ReactNode;
  tooltipContentProps?: TooltipProps["contentProps"];
  isMono?: boolean;
}

export default function LabelWithTooltip({
  className,
  tooltip,
  tooltipContentProps,
  isMono,
  children,
}: LabelProps) {
  const Component = isMono ? TLabel : TLabelSans;

  return (
    <Tooltip title={tooltip} contentProps={tooltipContentProps}>
      <Component
        className={cn(
          "flex w-max flex-row items-center gap-1",
          className,
          !!tooltip &&
            cn("decoration-muted-foreground/50", hoverUnderlineClassName),
        )}
      >
        {children}
      </Component>
    </Tooltip>
  );
}
