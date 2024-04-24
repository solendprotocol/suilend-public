import BigNumber from "bignumber.js";
import { Wallet } from "lucide-react";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import AssetTable from "@/components/dashboard/AssetTable";
import Card from "@/components/dashboard/Card";
import { CardContent } from "@/components/ui/card";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";

export default function WalletBalancesCard() {
  const { address } = useWalletContext();
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  if (!address) return null;
  return (
    <Card
      id="wallet-balances"
      titleIcon={<Wallet />}
      title="Wallet balances"
      noHeaderSeparator
    >
      <CardContent className="p-0">
        <AssetTable
          amountTitle="Balance"
          assets={Object.values(data.coinBalancesMap)
            .filter((cb) => !cb.balance.eq(0))
            .map((cb) => ({
              coinType: cb.coinType,
              mintDecimals: cb.mintDecimals,
              price: cb.price as BigNumber,
              symbol: cb.symbol,
              iconUrl: cb.iconUrl,
              amount: cb.balance,
              amountUsd: cb.balance.times(cb.price as BigNumber),
              reserve: data.lendingMarket.reserves.find(
                (r) => r.coinType === cb.coinType,
              ) as ParsedReserve,
            }))}
          noAssetsMessage="No assets"
        />
      </CardContent>
    </Card>
  );
}
