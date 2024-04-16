import TokenIcon from "@/components/shared/TokenIcon";
import { LOGO_MAP, NORMALIZED_SUILEND_POINTS_COINTYPE } from "@/lib/coinType";

export default function PointsIcon() {
  return (
    <TokenIcon
      className="h-4 w-4"
      coinType={NORMALIZED_SUILEND_POINTS_COINTYPE}
      symbol="Suilend Points"
      url={LOGO_MAP[NORMALIZED_SUILEND_POINTS_COINTYPE]}
    />
  );
}
