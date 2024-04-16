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
import PointsSplash from "@/components/points/PointsSplash";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import {
  bodyClassNames,
  labelSansClassNames,
} from "@/components/shared/Typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppContext } from "@/contexts/AppContext";
import { DashboardContextProvider } from "@/contexts/DashboardContext";
import { useWalletContext } from "@/contexts/WalletContext";
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

function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isImpersonatingAddress } = useWalletContext();

  return (
    <>
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

      {/* Vertical layout (<lg) */}
      <div className="flex w-full flex-col gap-6 lg:hidden">
        <div className="flex flex-col gap-2">
          <MarketOverview />
          <Cards />
        </div>

        <MarketTable />
        {!address && <PointsSplash />}
      </div>

      {/* Horizontal layout (lg+) */}
      <div className="hidden w-full flex-row gap-10 lg:flex">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <MarketOverview />
          <MarketTable />
          {!address && <PointsSplash />}
        </div>
        <div className="flex w-[360px] shrink-0 flex-col gap-4">
          <Cards />
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { suilendClient, data } = useAppContext();
  if (!suilendClient || !data) return <FullPageSpinner />;

  return (
    <DashboardContextProvider>
      <Page />
    </DashboardContextProvider>
  );
}
