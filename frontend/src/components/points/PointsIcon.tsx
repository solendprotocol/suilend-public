import { ClassValue } from "clsx";

import TokenLogo from "@/components/shared/TokenLogo";
import { LOGO_MAP, NORMALIZED_SUILEND_POINTS_COINTYPE } from "@/lib/coinType";
import { cn } from "@/lib/utils";

interface PointsIconProps {
  className?: ClassValue;
}

export default function PointsIcon({ className }: PointsIconProps) {
  return (
    <TokenLogo
      className={cn("h-4 w-4", className)}
      coinType={NORMALIZED_SUILEND_POINTS_COINTYPE}
      symbol="Suilend Points"
      src={LOGO_MAP[NORMALIZED_SUILEND_POINTS_COINTYPE]}
    />
  );
}
