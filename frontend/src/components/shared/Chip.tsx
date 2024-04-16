import { PropsWithChildren } from "react";

import { PlusCircle } from "lucide-react";

import { TLabel } from "@/components/shared/Typography";

interface ChipProps extends PropsWithChildren {
  hasPlus?: boolean;
}

export default function Chip({ hasPlus, children }: ChipProps) {
  return (
    <div className="flex flex-row items-center gap-1 text-primary-foreground">
      {hasPlus && <PlusCircle className="h-4 w-4" />}

      <div className="flex h-6 flex-col justify-center rounded-full border border-secondary px-2">
        <TLabel className="uppercase text-primary-foreground">
          {children}
        </TLabel>
      </div>
    </div>
  );
}
