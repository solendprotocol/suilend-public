import { PropsWithChildren, ReactNode } from "react";

import {
  PopoverContentProps,
  PopoverProps as PopoverRootProps,
} from "@radix-ui/react-popover";

import { TLabelSans } from "@/components/shared/Typography";
import {
  PopoverContent,
  Popover as PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fontClassNames } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export const getPopoverId = (id: string) => `popover.${id}`;

interface PopoverProps extends PropsWithChildren {
  label?: string;
  id: string;
  rootProps?: PopoverRootProps;
  trigger?: ReactNode;
  contentProps?: PopoverContentProps;
}

export default function Popover({
  label,
  id,
  rootProps,
  trigger,
  contentProps,
  children,
}: PopoverProps) {
  const { className: contentClassName, ...restContentProps } =
    contentProps || {};

  const popoverId = getPopoverId(id);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={popoverId}>
          <TLabelSans>{label}</TLabelSans>
        </label>
      )}
      <PopoverRoot {...rootProps}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        {/* Set fonts on popover as using PopoverPortal with container set to the app container (see Tooltip) doesn't work */}
        <PopoverContent
          id={popoverId}
          className={cn("rounded-md", fontClassNames, contentClassName)}
          collisionPadding={4}
          style={{
            maxWidth: "var(--radix-popover-content-available-width)",
          }}
          {...restContentProps}
        >
          {children}
        </PopoverContent>
      </PopoverRoot>
    </div>
  );
}
