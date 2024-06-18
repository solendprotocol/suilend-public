import Head from "next/head";

import { Info } from "lucide-react";

import TextLink from "@/components/shared/TextLink";
import { bodySansClassNames } from "@/components/shared/Typography";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { isEth, isUsdc, isUsdt } from "@/lib/coinType";
import { formatList } from "@/lib/format";
import { DOCS_BRIDGE_LEARN_MORE_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export default function Bridge() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  const bridgedAssetReserves = data.lendingMarket.reserves.filter(
    (reserve) =>
      isUsdc(reserve.coinType) ||
      isUsdt(reserve.coinType) ||
      (isEth(reserve.coinType) && reserve.config.depositLimit.gt(0)),
  );

  return (
    <>
      <Head>
        <title>Suilend Bridge</title>
      </Head>

      <div className="flex w-full flex-col items-center">
        <Alert className="mb-8 max-w-[650px] rounded-sm">
          <Info className="my-0.5 h-4 w-4 !text-muted-foreground" />
          <AlertTitle
            className={cn(bodySansClassNames, "mb-0 tracking-normal")}
          >
            {"Note: Only Wormhole Wrapped Ethereum-native "}
            {formatList(bridgedAssetReserves.map((reserve) => reserve.symbol))}
            {" are supported on Suilend. "}
            <TextLink href={DOCS_BRIDGE_LEARN_MORE_URL}>Learn more</TextLink>
          </AlertTitle>
        </Alert>
      </div>
    </>
  );
}
