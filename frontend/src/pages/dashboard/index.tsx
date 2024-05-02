import Head from "next/head";
import { usePathname, useRouter } from "next/navigation";

import { VenetianMask } from "lucide-react";

import LiquidityMiningCard from "@/components/dashboard/LiquidityMiningCard";
import MarketOverview from "@/components/dashboard/MarketOverview";
import MarketTable from "@/components/dashboard/MarketTable";
import ObligationBorrowsCard from "@/components/dashboard/ObligationBorrowsCard";
import ObligationDepositsCard from "@/components/dashboard/ObligationDepositsCard";
import ObligationPositionCard from "@/components/dashboard/ObligationPositionCard";
import WalletAssetsCard from "@/components/dashboard/WalletBalancesCard";
import {
  bodyClassNames,
  labelSansClassNames,
} from "@/components/shared/Typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardContextProvider } from "@/contexts/DashboardContext";
import { useWalletContext } from "@/contexts/WalletContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import { formatAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

function Cards() {
  return (
    <>
      <LiquidityMiningCard />
      <ObligationPositionCard />
      <ObligationDepositsCard />
      <ObligationBorrowsCard />
      <WalletAssetsCard />
    </>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isImpersonatingAddress } = useWalletContext();

  const { lg } = useBreakpoint();

  return (
    <DashboardContextProvider>
      <Head>
        <title>Suilend Dashboard</title>
      </Head>

      {address && isImpersonatingAddress && (
        <Alert
          className="mb-6 cursor-pointer"
          onClick={() => {
            router.push(pathname);
          }}
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
      )}

      {!lg ? (
        // Vertical layout
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-2">
            <MarketOverview />
            <Cards />
            <div className="mt-4 w-full">
              <MarketTable />
            </div>
          </div>
        </div>
      ) : (
        // Horizontal layout
        <div className="flex w-full flex-row gap-10">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <MarketOverview />
            <MarketTable />
          </div>
          <div className="flex w-[360px] shrink-0 flex-col gap-4">
            <Cards />
          </div>
        </div>
      )}
    </DashboardContextProvider>
  );
}
