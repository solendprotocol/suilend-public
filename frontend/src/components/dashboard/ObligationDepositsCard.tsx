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
        title: "Assets deposited",
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
            amountUsd: d.depositedAmount.times(d.reserve.price),
            reserve: d.reserve,
          }))}
          noAssetsMessage="No deposits"
        />
      </CardContent>
    </Card>
  );
}
