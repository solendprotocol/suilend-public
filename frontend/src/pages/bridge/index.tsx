import Head from "next/head";

import { Info } from "lucide-react";

import TextLink from "@/components/shared/TextLink";
import { bodySansClassNames } from "@/components/shared/Typography";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { DOCS_BRIDGE_LEARN_MORE_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export default function Bridge() {
  return (
    <>
      <Head>
        <title>Suilend Bridge</title>
      </Head>

      <div className="flex w-full flex-col items-center gap-8">
        <Alert className="max-w-[650px]">
          <Info className="my-0.5 h-4 w-4 !text-muted-foreground" />
          <AlertTitle
            className={cn(bodySansClassNames, "mb-0 tracking-normal")}
          >
            Note: Only Wormhole Wrapped Ethereum-native USDC and USDT are
            supported on Suilend.{" "}
            <TextLink href={DOCS_BRIDGE_LEARN_MORE_URL}>Learn more</TextLink>
          </AlertTitle>
        </Alert>
      </div>
    </>
  );
}
