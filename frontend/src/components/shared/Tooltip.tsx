import {
  ElementRef,
  PropsWithChildren,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  TooltipContentProps,
  TooltipPortal,
  TooltipPortalProps,
  TooltipProps as TooltipRootProps,
  TooltipTriggerProps,
} from "@radix-ui/react-tooltip";
import { merge } from "lodash";

import { TBodySans } from "@/components/shared/Typography";
import {
  TooltipContent,
  Tooltip as TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useIsTouchscreen from "@/hooks/useIsTouchscreen";
import { cn } from "@/lib/utils";

interface TooltipTriggerContext {
  onOpenChange: (isOpen: boolean) => void;
}

const TooltipTriggerContext = createContext<TooltipTriggerContext>({
  onOpenChange: () => {
    throw Error("TooltipTriggerContextProvider not initialized");
  },
});

function CustomTooltipRoot({
  delayDuration,
  children,
  ...props
}: TooltipRootProps) {
  const isTouchscreen = useIsTouchscreen();
  const [open, setOpen] = useState<boolean>(props.defaultOpen ?? false);

  const contextValue: TooltipTriggerContext = useMemo(
    () => ({
      onOpenChange: setOpen,
    }),
    [],
  );

  return (
    <TooltipRoot
      open={props.open || open}
      onOpenChange={setOpen}
      delayDuration={isTouchscreen ? 0 : delayDuration ?? 0}
      {...props}
    >
      <TooltipTriggerContext.Provider value={contextValue}>
        {children}
      </TooltipTriggerContext.Provider>
    </TooltipRoot>
  );
}

const CustomTooltipTrigger = forwardRef<
  ElementRef<typeof TooltipTrigger>,
  TooltipTriggerProps
>(({ children, ...props }, ref) => {
  const isTouchscreen = useIsTouchscreen();
  const { onOpenChange } = useContext(TooltipTriggerContext);

  return (
    <TooltipTrigger
      ref={ref}
      onClick={(e) => {
        if (!isTouchscreen) return;
        e.preventDefault();
        onOpenChange(true);
      }}
      {...props}
    >
      {children}
    </TooltipTrigger>
  );
});
CustomTooltipTrigger.displayName = "CustomTooltipTrigger";

export interface TooltipProps extends PropsWithChildren {
  rootProps?: TooltipRootProps;
  portalProps?: TooltipPortalProps;
  contentProps?: TooltipContentProps;
  title?: string | ReactNode;
  content?: ReactNode;
}

export default function Tooltip({
  rootProps,
  portalProps,
  contentProps,
  title,
  content,
  children,
}: TooltipProps) {
  const {
    className: contentClassName,
    style: contentStyle,
    ...restContentProps
  } = contentProps || {};

  if (title === undefined && content === undefined) return children;
  return (
    <CustomTooltipRoot delayDuration={250} {...rootProps}>
      <CustomTooltipTrigger asChild>{children}</CustomTooltipTrigger>

      {/* The font classes are loaded on the main tag in _app.tsx so tooltips must be nested */}
      <TooltipPortal
        container={
          typeof document === "undefined"
            ? undefined
            : document.getElementById("__app_main")
        }
        {...portalProps}
      >
        <TooltipContent
          className={cn("z-[100] break-words", contentClassName)}
          collisionPadding={4}
          style={merge(
            {
              maxWidth:
                "min(var(--radix-tooltip-content-available-width), 300px)",
            },
            contentStyle,
          )}
          onClick={(e) => e.stopPropagation()}
          {...restContentProps}
        >
          {content || <TBodySans className="text-xs">{title}</TBodySans>}
        </TooltipContent>
      </TooltipPortal>
    </CustomTooltipRoot>
  );
}
