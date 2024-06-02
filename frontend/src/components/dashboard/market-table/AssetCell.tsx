import { ReservesRowData } from "@/components/dashboard/MarketTable";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TLabel } from "@/components/shared/Typography";
import { formatPrice } from "@/lib/format";

type AssetCellProps = Pick<
  ReservesRowData,
  "coinType" | "price" | "symbol" | "iconUrl"
>;

export default function AssetCell({
  coinType,
  price,
  symbol,
  iconUrl,
}: AssetCellProps) {
  return (
    <div className="flex flex-row items-center gap-3">
      <TokenLogo
        showTooltip
        coinType={coinType}
        symbol={symbol}
        src={iconUrl}
      />

      <div className="flex flex-col gap-1">
        <TBody>{symbol}</TBody>
        <TLabel>{formatPrice(price)}</TLabel>
      </div>
    </div>
  );
}
