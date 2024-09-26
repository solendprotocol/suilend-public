import { ReservesRowData } from "@/components/dashboard/MarketTable";
import TokenLogo from "@/components/shared/TokenLogo";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabel } from "@/components/shared/Typography";
import { isFud } from "@/lib/coinType";
import { formatPrice } from "@/lib/format";
import { ISOLATED_TOOLTIP } from "@/lib/tooltips";

type AssetCellProps = Pick<
  ReservesRowData,
  "coinType" | "price" | "symbol" | "iconUrl" | "isIsolated"
>;

export default function AssetCell({
  coinType,
  price,
  symbol,
  iconUrl,
  isIsolated,
}: AssetCellProps) {
  return (
    <div className="flex flex-row items-center gap-3">
      <TokenLogo showTooltip token={{ coinType, symbol, iconUrl }} />

      <div className="flex flex-col gap-1">
        <div className="flex w-max flex-row items-center gap-2">
          <TBody>{symbol}</TBody>

          {isIsolated && (
            <Tooltip title={ISOLATED_TOOLTIP}>
              <TLabel className="rounded-md bg-secondary px-1 py-0.5 font-medium uppercase text-secondary-foreground">
                Isolated
              </TLabel>
            </Tooltip>
          )}
        </div>

        <TLabel>
          {formatPrice(price, { dp: isFud(coinType) ? 8 : undefined })}
        </TLabel>
      </div>
    </div>
  );
}
