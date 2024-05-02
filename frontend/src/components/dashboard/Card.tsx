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
  header?: {
    titleIcon?: ReactElement;
    title?: string;
    startContent?: ReactNode;
    endContent?: ReactNode;
    noSeparator?: boolean;
  };
}

export default function Card({ id, header, children, ...props }: CardProps) {
  const { className, ...restProps } = props;

  const [isCollapsed, setIsCollapsed] = useLocalStorage<boolean>(
    id ?? "",
    false,
  );
  const toggleIsCollapsed = () => setIsCollapsed((is) => !is);

  const isCollapsible = !!id;

  return (
    <CardRoot
      className={cn(
        "text-unset w-full overflow-hidden rounded-sm shadow-none",
        className,
      )}
      {...restProps}
    >
      {header && (
        <CardHeader className="flex flex-col gap-2 space-y-0">
          <div className="flex h-5 flex-row items-center gap-1">
            <TTitle
              className={cn(
                "flex flex-row items-center gap-2 uppercase",
                isCollapsible && "cursor-pointer",
              )}
              onClick={isCollapsible ? toggleIsCollapsed : undefined}
            >
              {header.titleIcon &&
                cloneElement(header.titleIcon, {
                  className: "w-3 h-3 shrink-0",
                })}
              {header.title}
            </TTitle>
            {header.startContent}

            <div className="flex flex-1 flex-row items-center justify-end gap-1">
              {header.endContent}

              {isCollapsible && (
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

          {!isCollapsed && !header.noSeparator && <Separator />}
        </CardHeader>
      )}

      {!isCollapsed && children}
    </CardRoot>
  );
}
