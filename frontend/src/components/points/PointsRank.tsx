import { Star } from "lucide-react";

import { TBody } from "@/components/shared/Typography";
import { formatInteger } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PointsRankProps {
  rank: number;
}

export default function PointsRank({ rank }: PointsRankProps) {
  return (
    <TBody
      className={cn(
        "flex flex-row items-center gap-1",
        rank === 1 && "text-gold",
        rank === 2 && "text-silver",
        rank === 3 && "text-bronze",
      )}
    >
      #{formatInteger(rank)}
      {[1, 2, 3].includes(rank) && <Star className="h-3 w-3" />}
    </TBody>
  );
}
