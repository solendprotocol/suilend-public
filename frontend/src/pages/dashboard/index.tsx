import Head from "next/head";

import ActionsModal from "@/components/dashboard/actions-modal/ActionsModal";
import MarketOverview from "@/components/dashboard/MarketOverview";
import MarketTable from "@/components/dashboard/MarketTable";
import ObligationBorrowsCard from "@/components/dashboard/ObligationBorrowsCard";
import ObligationDepositsCard from "@/components/dashboard/ObligationDepositsCard";
import ObligationPositionCard from "@/components/dashboard/ObligationPositionCard";
import ProtocolRewardsCard from "@/components/dashboard/ProtocolRewardsCard";
import WalletAssetsCard from "@/components/dashboard/WalletBalancesCard";
import ImpersonationModeBanner from "@/components/shared/ImpersonationModeBanner";
import { DashboardContextProvider } from "@/contexts/DashboardContext";
import useBreakpoint from "@/hooks/useBreakpoint";

function Cards() {
  return (
    <>
      <ObligationPositionCard />
      <ObligationDepositsCard />
      <ObligationBorrowsCard />
      <WalletAssetsCard />
    </>
  );
}

export default function Dashboard() {
  const { lg } = useBreakpoint();

  return (
    <DashboardContextProvider>
      <Head>
        <title>Suilend Dashboard</title>
      </Head>

      <ImpersonationModeBanner />

      {!lg ? (
        // Vertical layout
        <div className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-2">
            <MarketOverview />
            <Cards />
          </div>
          <MarketTable />
          <ProtocolRewardsCard />
        </div>
      ) : (
        // Horizontal layout
        <div className="flex w-full flex-row gap-10">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <MarketOverview />
            <MarketTable />
            <ProtocolRewardsCard />
          </div>
          <div className="flex w-[360px] shrink-0 flex-col gap-4">
            <Cards />
          </div>
        </div>
      )}

      <ActionsModal />
    </DashboardContextProvider>
  );
}
