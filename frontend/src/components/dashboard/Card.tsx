import { PropsWithChildren, ReactElement, ReactNode } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

import Button from "@/components/shared/Button";
import TitleWithIcon from "@/components/shared/TitleWithIcon";
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
          <div className="flex h-5 flex-row items-center">
            <div
              className={cn("flex-1", isCollapsible && "cursor-pointer")}
              onClick={isCollapsible ? toggleIsCollapsed : undefined}
            >
              <TitleWithIcon className="w-full" icon={header.titleIcon}>
                {header.title}
              </TitleWithIcon>
            </div>

            <div className="flex flex-row items-center justify-end gap-1">
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
