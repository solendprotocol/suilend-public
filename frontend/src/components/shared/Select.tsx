import { ReactNode } from "react";

import { SelectProps as SelectRootProps } from "@radix-ui/react-select";

import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  Select as SelectRoot,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SelectProps {
  root?: SelectRootProps;
  trigger: ReactNode;
  items: {
    id: string;
    name: string;
  }[];
  selectedItemId?: string;
  setValue: (selectedItemId: string) => void;
  title?: string;
}

export default function Select({
  root,
  trigger,
  items,
  selectedItemId,
  setValue,
  title,
}: SelectProps) {
  return (
    <SelectRoot onValueChange={setValue} value={selectedItemId} {...root}>
      {trigger}
      <SelectContent
        className="rounded-md"
        scrollUpButton={{ className: "hidden" }}
        viewport={{ className: "p-4" }}
        scrollDownButton={{ className: "hidden" }}
        style={{
          maxHeight: "var(--radix-select-content-available-height)",
          overflowY: "auto",
          minWidth: "200px",
        }}
      >
        <SelectGroup>
          {title && (
            <SelectLabel className="mb-4 px-0 py-0 font-sans font-normal text-primary-foreground">
              {title}
            </SelectLabel>
          )}
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <SelectItem
                key={item.id}
                value={item.id}
                className={cn(
                  "cursor-pointer border py-2 pl-3 pr-10 font-sans text-xs text-muted transition-colors focus:border-secondary focus:bg-secondary/5 focus:text-primary-foreground",
                  item.id === selectedItemId &&
                    "border-secondary bg-secondary/5 text-primary-foreground",
                )}
                itemIndicatorContainer={{
                  className: "left-auto right-3 w-4 h-4",
                }}
              >
                {item.name}
              </SelectItem>
            ))}
          </div>
        </SelectGroup>
      </SelectContent>
    </SelectRoot>
  );
}
