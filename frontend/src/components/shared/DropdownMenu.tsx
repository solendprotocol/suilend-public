import { PropsWithChildren, ReactNode } from "react";

import { DropdownMenuProps as DropdownMenuRootProps } from "@radix-ui/react-dropdown-menu";
import { ClassValue } from "clsx";

import {
  DropdownMenuContent,
  DropdownMenuItem as DropdownMenuItemComponent,
  DropdownMenuLabel,
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuSeparator as DropdownMenuSeparatorComponent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DropdownMenuItemProps extends PropsWithChildren {
  className?: ClassValue;
  isSelected?: boolean;
  onClick: () => void;
}

export function DropdownMenuItem({
  className,
  onClick,
  isSelected,
  children,
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuItemComponent
      className={cn(
        "cursor-pointer border px-3 py-2 font-sans text-xs text-muted-foreground focus:border-transparent focus:bg-muted/10 focus:text-foreground",
        isSelected && "border-transparent bg-muted/15 text-foreground",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </DropdownMenuItemComponent>
  );
}

export function DropdownMenuSeparator() {
  return <DropdownMenuSeparatorComponent className="bg-border" />;
}

interface DropdownMenuProps {
  rootProps?: DropdownMenuRootProps;
  trigger: ReactNode;
  title?: string;
  description?: ReactNode;
  items: ReactNode;
}

export default function DropdownMenu({
  rootProps,
  trigger,
  title,
  description,
  items,
}: DropdownMenuProps) {
  return (
    <DropdownMenuRoot {...rootProps}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="rounded-md p-4"
        align="end"
        collisionPadding={4}
        style={{
          maxHeight: "var(--radix-dropdown-menu-content-available-height)",
          overflowY: "auto",
          minWidth: "280px",
          maxWidth: "300px",
        }}
      >
        {title && (
          <div className="mb-4 flex flex-col gap-1">
            <DropdownMenuLabel className="overflow-hidden text-ellipsis px-0 py-0 font-sans font-normal text-primary-foreground">
              {title}
            </DropdownMenuLabel>
            {description}
          </div>
        )}

        <div className="flex flex-col gap-2">{items}</div>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
