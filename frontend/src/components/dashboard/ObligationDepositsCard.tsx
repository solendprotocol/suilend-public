import { PiggyBank } from "lucide-react";

import AccountAssetTable from "@/components/dashboard/AccountAssetTable";
import Card from "@/components/dashboard/Card";
import { CardContent } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";

export default function ObligationDepositsCard() {
  const { obligation } = useAppContext();

  if (!obligation) return null;
  return (
    <Card
      id="assets-deposited"
      header={{
        titleIcon: <PiggyBank />,
        title: (
          <>
            Deposited assets
            {obligation.depositPositionCount > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                {obligation.depositPositionCount}
              </span>
            )}
          </>
        ),
        noSeparator: true,
      }}
    >
      <CardContent className="p-0">
        <AccountAssetTable
          assets={obligation.deposits.map((d) => ({
            coinType: d.coinType,
            mintDecimals: d.reserve.mintDecimals,
            price: d.reserve.price,
            symbol: d.reserve.symbol,
            iconUrl: d.reserve.iconUrl,
            amount: d.depositedAmount,
            amountUsd: d.depositedAmountUsd,
            reserve: d.reserve,
          }))}
          noAssetsMessage="No deposits"
        />
      </CardContent>
    </Card>
  );
}
