import { ClassValue } from "clsx";

import TokenIcon from "@/components/shared/TokenIcon";
import { LOGO_MAP, NORMALIZED_SUILEND_POINTS_COINTYPE } from "@/lib/coinType";
import { cn } from "@/lib/utils";

interface PointsIconProps {
  className?: ClassValue;
}

export default function PointsIcon({ className }: PointsIconProps) {
  return (
    <TokenIcon
      className={cn("h-4 w-4", className)}
      coinType={NORMALIZED_SUILEND_POINTS_COINTYPE}
      symbol="Suilend Points"
      url={LOGO_MAP[NORMALIZED_SUILEND_POINTS_COINTYPE]}
    />
  );
}
