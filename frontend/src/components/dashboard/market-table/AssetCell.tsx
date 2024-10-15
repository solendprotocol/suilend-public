import { ReservesRowData } from "@/components/dashboard/MarketTable";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TLabel } from "@/components/shared/Typography";
import {
  DEEP_PRICE_IDENTIFIER,
  NORMALIZED_DEEP_COINTYPE,
} from "@/lib/coinType";
import { formatPrice } from "@/lib/format";

type AssetCellProps = Pick<
  ReservesRowData,
  "coinType" | "price" | "symbol" | "iconUrl" | "reserve"
>;

export default function AssetCell({
  coinType,
  price,
  symbol,
  iconUrl,
  reserve,
}: AssetCellProps) {
  return (
    <div className="flex flex-row items-center gap-3">
      <TokenLogo showTooltip token={{ coinType, symbol, iconUrl }} />

      <div className="flex flex-col gap-1">
        <TBody>{symbol}</TBody>
        <TLabel>
          {coinType === NORMALIZED_DEEP_COINTYPE &&
          reserve.priceIdentifier !== DEEP_PRICE_IDENTIFIER
            ? "--"
            : formatPrice(price)}
        </TLabel>
      </div>
    </div>
  );
}
