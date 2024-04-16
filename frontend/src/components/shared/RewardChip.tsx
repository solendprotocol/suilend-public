import { PlusCircle } from "lucide-react";

import { TLabel } from "@/components/shared/Typography";

interface RewardChipProps {
  symbol: string;
}

export default function RewardChip({ symbol }: RewardChipProps) {
  return (
    <div className="flex flex-row items-center gap-1 text-primary-foreground">
      <PlusCircle className="h-4 w-4" />

      <div className="flex h-6 flex-col justify-center rounded-full border border-secondary px-2">
        <TLabel className="uppercase text-primary-foreground">
          {symbol} rewards
        </TLabel>
      </div>
    </div>
  );
}
