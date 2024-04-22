import {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  cloneElement,
} from "react";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

import Button from "@/components/shared/Button";
import { TTitle } from "@/components/shared/Typography";
import {
  CardHeader,
  Card as CardRoot,
  CardProps as CardRootProps,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CardProps extends PropsWithChildren, CardRootProps {
  id?: string;
  titleIcon?: ReactElement;
  title?: string;
  headerEndContent?: ReactNode;
  alwaysExpanded?: boolean;
  noHeaderSeparator?: boolean;
}

export default function Card({
  id,
  titleIcon,
  title,
  headerEndContent,
  alwaysExpanded,
  noHeaderSeparator,
  children,
  ...props
}: CardProps) {
  const { className, ...restProps } = props;
  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(
    id ?? "",
    false,
  );
  const toggleIsCollapsed = () => setIsCollapsed((is) => !is);

  const canToggle = !alwaysExpanded;
  const showContent = !isCollapsed;
  const showHeaderSeparator = showContent && !noHeaderSeparator;

  return (
    <CardRoot
      className={cn(
        "text-unset w-full overflow-hidden rounded-sm shadow-none",
        className,
      )}
      {...restProps}
    >
      {title && (
        <CardHeader className="flex flex-col gap-2 space-y-0">
          <div className="flex flex-row items-center">
            <TTitle
              className={cn(
                "flex flex-1 flex-row items-center gap-2 uppercase",
                canToggle && "cursor-pointer",
              )}
              onClick={canToggle ? toggleIsCollapsed : undefined}
            >
              {titleIcon &&
                cloneElement(titleIcon, {
                  className: "w-3 h-3 shrink-0",
                })}
              {title}
            </TTitle>

            <div className="flex h-5 flex-row items-center gap-1">
              {headerEndContent}

              {canToggle && (
                <Button
                  className="text-muted-foreground"
                  icon={isCollapsed ? <ChevronDown /> : <ChevronUp />}
                  variant="ghost"
                  size="icon"
                  onClick={toggleIsCollapsed}
                >
                  Toggle
                </Button>
              )}
            </div>
          </div>

          {showHeaderSeparator && <Separator />}
        </CardHeader>
      )}

      {showContent && children}
    </CardRoot>
  );
}
