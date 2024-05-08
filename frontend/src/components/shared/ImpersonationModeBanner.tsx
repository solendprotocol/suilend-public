import { useRouter } from "next/router";

import { VenetianMask } from "lucide-react";

import {
  bodyClassNames,
  labelSansClassNames,
} from "@/components/shared/Typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ImpersonationModeBanner() {
  const router = useRouter();
  const { address, isImpersonatingAddress } = useWalletContext();

  const onClick = () => {
    const { wallet, ...restQuery } = router.query;
    router.push({ query: restQuery });
  };

  return (
    address &&
    isImpersonatingAddress && (
      <Alert
        className="mb-6 cursor-pointer rounded-sm transition-colors hover:bg-muted/10"
        onClick={onClick}
      >
        <div className="flex flex-row items-center gap-4">
          <VenetianMask className="h-8 w-8" />
          <div className="flex-1">
            <AlertTitle
              className={cn(bodyClassNames, "uppercase tracking-normal")}
            >
              Impersonating {formatAddress(address)}
            </AlertTitle>
            <AlertDescription className={labelSansClassNames}>
              Click this banner to exit impersonation mode.
            </AlertDescription>
          </div>
        </div>
      </Alert>
    )
  );
}
