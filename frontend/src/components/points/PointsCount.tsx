import BigNumber from "bignumber.js";
import { ClassValue } from "clsx";

import PointsIcon from "@/components/points/PointsIcon";
import { TBody } from "@/components/shared/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PointsCountProps {
  className?: ClassValue;
  iconClassName?: ClassValue;
  labelClassName?: ClassValue;
  points?: BigNumber;
}

export default function PointsCount({
  className,
  iconClassName,
  labelClassName,
  points,
}: PointsCountProps) {
  return (
    <div className={cn("flex w-max flex-row items-center gap-1.5", className)}>
      <PointsIcon className={iconClassName} />
      {points !== undefined ? (
        <TBody className={cn(labelClassName)}>{formatPoints(points)}</TBody>
      ) : (
        <Skeleton className="h-5 w-10" />
      )}
    </div>
  );
}
