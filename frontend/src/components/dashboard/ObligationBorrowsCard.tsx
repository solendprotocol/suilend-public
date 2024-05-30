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
        title: (
          <>
            Borrowed assets
            {obligation.borrowPositionCount > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                {obligation.borrowPositionCount}
              </span>
            )}
          </>
        ),
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
            amountUsd: b.borrowedAmountUsd,
            reserve: b.reserve,
          }))}
          noAssetsMessage="No borrows"
        />
      </CardContent>
    </Card>
  );
}
