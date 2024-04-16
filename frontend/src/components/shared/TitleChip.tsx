import { PropsWithChildren } from "react";

import { TLabel } from "@/components/shared/Typography";

export default function TitleChip({ children }: PropsWithChildren) {
  return (
    <div className="flex h-6 w-max flex-col justify-center rounded-md bg-secondary px-3">
      <TLabel className="font-bold uppercase text-secondary-foreground">
        {children}
      </TLabel>
    </div>
  );
}
