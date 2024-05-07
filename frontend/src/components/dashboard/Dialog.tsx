import {
  CSSProperties,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  cloneElement,
} from "react";

import { DialogProps as DialogRootProps } from "@radix-ui/react-dialog";
import { ClassValue } from "clsx";

import { TTitle } from "@/components/shared/Typography";
import {
  DialogContent,
  DialogContentProps,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogProps extends PropsWithChildren {
  rootProps?: DialogRootProps;
  trigger: ReactNode;
  contentProps?: DialogContentProps;
  headerClassName?: ClassValue;
  titleIcon?: ReactElement;
  title?: string;
  headerEndContent?: ReactNode;
}

export default function Dialog({
  rootProps,
  trigger,
  contentProps,
  headerClassName,
  titleIcon,
  title,
  headerEndContent,
  children,
}: DialogProps) {
  const { className: contentClassName, ...restContentProps } =
    contentProps || {};

  return (
    <DialogRoot {...rootProps}>
      <DialogTrigger asChild className="appearance-none">
        {trigger}
      </DialogTrigger>

      <DialogContent
        className={cn(
          "flex h-dvh max-h-none max-w-none flex-col gap-0 overflow-hidden bg-popover p-0 sm:h-[calc(100dvh-var(--sm-my)*2)] sm:w-[calc(100dvw-var(--sm-mx)*2)] sm:max-w-4xl",
          contentClassName,
        )}
        style={{ "--sm-mx": "2rem", "--sm-my": "2rem" } as CSSProperties}
        onOpenAutoFocus={(e) => e.preventDefault()}
        overlay={{ className: "bg-background/80" }}
        {...restContentProps}
      >
        <DialogHeader
          className={cn(
            "relative h-max space-y-0 border-b p-4",
            headerClassName,
          )}
        >
          <TTitle className="flex flex-row items-center gap-2 uppercase">
            {titleIcon &&
              cloneElement(titleIcon, {
                className: "w-4 h-4 shrink-0",
              })}
            {title}
          </TTitle>

          {headerEndContent && (
            <div className="absolute right-[calc(8px+20px+16px)] top-1/2 flex -translate-y-2/4 flex-row gap-1">
              {headerEndContent}
            </div>
          )}
        </DialogHeader>

        {children}
      </DialogContent>
    </DialogRoot>
  );
}
