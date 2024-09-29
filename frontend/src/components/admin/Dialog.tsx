import {
  CSSProperties,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  cloneElement,
} from "react";

import { DialogProps as DialogRootProps } from "@radix-ui/react-dialog";

import {
  DialogContent,
  DialogContentProps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  Dialog as DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DialogProps extends PropsWithChildren {
  rootProps?: DialogRootProps;
  trigger: ReactNode;
  contentProps?: DialogContentProps;
  titleIcon?: ReactElement;
  title?: string | ReactNode;
  description?: ReactNode;
  descriptionAsChild?: boolean;
  noSeparator?: boolean;
  footer?: ReactNode;
}

export default function Dialog({
  rootProps,
  trigger,
  contentProps,
  titleIcon,
  title,
  description,
  descriptionAsChild,
  noSeparator,
  footer,
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
          "max-h-dvh max-w-none gap-4 overflow-y-auto bg-popover p-4 sm:max-h-[calc(100dvh-var(--sm-my)*2)] sm:w-[calc(100dvw-var(--sm-mx)*2)] sm:max-w-4xl",
          contentClassName,
        )}
        style={{ "--sm-mx": "2rem", "--sm-my": "2rem" } as CSSProperties}
        onOpenAutoFocus={(e) => e.preventDefault()}
        overlay={{ className: "bg-background/80" }}
        {...restContentProps}
      >
        {(title || description) && (
          <>
            <DialogHeader>
              {title && (
                <DialogTitle className="flex flex-row flex-wrap gap-2 text-left font-mono text-sm font-normal tracking-normal">
                  {titleIcon &&
                    cloneElement(titleIcon, {
                      className:
                        "text-muted-foreground w-4 h-4 shrink-0 my-[var(--my)]",
                      style: { "--my": `${(20 - 16) / 2}px` },
                    })}
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription
                  asChild={descriptionAsChild}
                  className="text-left"
                >
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>

            {!noSeparator && <Separator />}
          </>
        )}

        {children}

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </DialogRoot>
  );
}
