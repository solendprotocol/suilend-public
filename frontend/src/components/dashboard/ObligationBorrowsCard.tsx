import { HandCoins } from "lucide-react";

import AccountAssetTable from "@/components/dashboard/AccountAssetTable";
import Card from "@/components/dashboard/Card";
import { CardContent } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";

export default function ObligationBorrowsCard() {
  const { obligation } = useAppContext();

  if (!obligation) return null;
  return (
    <Card
      id="assets-borrowed"
      header={{
        titleIcon: <HandCoins />,
        title: "Assets borrowed",
        noSeparator: true,
      }}
    >
      <CardContent className="p-0">
        <AccountAssetTable
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
