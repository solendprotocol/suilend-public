import { PropsWithChildren } from "react";

import { ClassValue } from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";

import Button from "@/components/shared/Button";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CollapsibleProps extends PropsWithChildren {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title?: string;
  closedTitle?: string;
  openTitle?: string;
  buttonClassName?: ClassValue;
  buttonLabelClassName?: ClassValue;
  hasSeparator?: boolean;
}

export default function Collapsible({
  open,
  onOpenChange,
  title,
  closedTitle,
  openTitle,
  buttonClassName,
  buttonLabelClassName,
  hasSeparator,
  children,
}: CollapsibleProps) {
  const Icon = open ? ChevronUp : ChevronDown;

  return (
    <CollapsibleRoot open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="relative flex w-full flex-row items-center justify-center">
        {hasSeparator && <Separator className="flex-1" />}
        <Button
          className={cn(
            "relative z-[2] h-fit !bg-transparent uppercase text-muted-foreground",
            buttonClassName,
          )}
          labelClassName={buttonLabelClassName}
          endIcon={<Icon className="h-4 w-4" />}
          variant="ghost"
          size="sm"
          tag="div"
        >
          {title || (!open ? closedTitle : openTitle)}
        </Button>
        {hasSeparator && <Separator className="flex-1" />}
      </CollapsibleTrigger>

      <CollapsibleContent>{children}</CollapsibleContent>
    </CollapsibleRoot>
  );
}
