import AssetTable from "@/components/dashboard/AssetTable";
import Card from "@/components/dashboard/Card";
import { CardContent } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";

export default function BorrowsCard() {
  const { obligation } = useAppContext();

  if (!obligation) return null;
  return (
    <Card id="assets-borrowed" title="Assets borrowed" noHeaderSeparator>
      <CardContent className="p-0">
        <AssetTable
          assets={obligation.borrows.map((b) => ({
            coinType: b.coinType,
            mintDecimals: b.reserve.mintDecimals,
            price: b.reserve.price,
            symbol: b.reserve.symbol,
            iconUrl: b.reserve.iconUrl,
            amount: b.borrowedAmount,
            amountUsd: b.borrowedAmount.times(b.reserve.price),
            reserve: b.reserve,
          }))}
          noAssetsMessage="No borrows"
        />
      </CardContent>
    </Card>
  );
}
