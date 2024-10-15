import { ReservesRowData } from "@/components/dashboard/MarketTable";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TLabel } from "@/components/shared/Typography";
import { COINTYPE_PYTH_PRICE_ID_SYMBOL_MAP } from "@/lib/coinType";
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
          {reserve.priceIdentifier !==
          COINTYPE_PYTH_PRICE_ID_SYMBOL_MAP[reserve.coinType].priceIdentifier
            ? "--"
            : formatPrice(price)}
        </TLabel>
      </div>
    </div>
  );
}
