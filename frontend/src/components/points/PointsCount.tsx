import BigNumber from "bignumber.js";
import clsx from "clsx";

import PointsIcon from "@/components/points/PointsIcon";
import { TBody } from "@/components/shared/Typography";
import { formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PointsCountProps {
  className?: clsx.ClassValue;
}

export default function PointsCount({ className }: PointsCountProps) {
  return (
    <div
      className={cn(
        "text-primary-foreground h-8 rounded-sm bg-[#142142] px-3 py-0",
        className,
      )}
    >
      <div className="flex h-full flex-row items-center gap-1.5">
        <PointsIcon />
        <TBody className="text-primary-foreground">
          {formatPoints(new BigNumber(8771.5221))}
        </TBody>
      </div>
    </div>
  );
}
