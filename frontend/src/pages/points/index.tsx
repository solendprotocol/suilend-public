import Head from "next/head";

import PointsHeader from "@/components/points/PointsHeader";
import PointsLeaderboardTable from "@/components/points/PointsLeaderboardTable";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import ImpersonationModeBanner from "@/components/shared/ImpersonationModeBanner";
import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";

function Page() {
  const { address, isImpersonatingAddress } = useWalletContext();
  const hasImpersonationModeBanner = address && isImpersonatingAddress;

  return (
    <>
      <Head>
        <title>Suilend Points</title>
      </Head>

      <ImpersonationModeBanner />

      <div className="flex w-full flex-col items-center gap-6">
        <div
          className={cn(
            "w-full",
            !hasImpersonationModeBanner && "-mt-4 md:-mt-6",
          )}
        >
          <PointsHeader />
        </div>
        <PointsLeaderboardTable />
      </div>
    </>
  );
}

export default function Points() {
  const { suilendClient, data } = useAppContext();
  if (!suilendClient || !data) return <FullPageSpinner />;

  return <Page />;
}
