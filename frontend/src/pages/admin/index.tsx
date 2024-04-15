import Head from "next/head";
import { useRouter } from "next/router";

import AddReserveDialog from "@/components/admin/AddReserveDialog";
import LiquidateDialog from "@/components/admin/LiquidateDialog";
import ObligationsDialog from "@/components/admin/ObligationsDialog";
import RateLimiterConfigDialog from "@/components/admin/RateLimiterConfigDialog";
import RateLimiterPropertiesDialog from "@/components/admin/RateLimiterPropertiesDialog";
import ReserveConfigDialog from "@/components/admin/ReserveConfigDialog";
import ReservePropertiesDialog from "@/components/admin/ReservePropertiesDialog";
import ReserveRewardsDialog from "@/components/admin/ReserveRewardsDialog";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import Tabs from "@/components/shared/Tabs";
import { TTitle } from "@/components/shared/Typography";
import Value from "@/components/shared/Value";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { AppData, useAppContext } from "@/contexts/AppContext";

function Page() {
  const router = useRouter();
  const tab = router.query.tab as string | undefined;

  const { explorer, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  const isEditable = !!data.lendingMarketOwnerCapId;

  // Tabs
  enum Tab {
    RESERVES = "reserves",
    RATE_LIMITER = "rateLimiter",
    LIQUIDATE = "liquidate",
    OBLIGATIONS = "obligations",
  }

  const tabs = [
    { id: Tab.RESERVES, title: "Reserves" },
    { id: Tab.RATE_LIMITER, title: "Rate limiter" },
    { id: Tab.LIQUIDATE, title: "Liquidate" },
    { id: Tab.OBLIGATIONS, title: "Obligations" },
  ];

  const selectedTab =
    tab && Object.values(Tab).includes(tab as Tab)
      ? (tab as Tab)
      : Tab.RESERVES;
  const onSelectedTabChange = (tab: Tab) => {
    router.push({ query: { tab } });
  };

  return (
    <>
      <Head>
        <title>Suilend Admin</title>
      </Head>

      <div className="flex w-full flex-col items-center">
        <div className="flex w-full max-w-[800px] flex-col">
          <Tabs
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={(tab) => onSelectedTabChange(tab as Tab)}
          >
            <TabsContent value={Tab.RESERVES} className="mt-0">
              <div className="flex w-full flex-col gap-2 ">
                {data.lendingMarket.reserves.map((reserve) => {
                  return (
                    <Card key={reserve.id}>
                      <CardHeader>
                        <TTitle>{reserve.symbol}</TTitle>
                        <CardDescription>
                          <Value
                            value={reserve.id}
                            url={explorer.buildObjectUrl(reserve.id)}
                            isId
                          />
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-row flex-wrap gap-2">
                        <ReserveConfigDialog reserve={reserve} />
                        <ReservePropertiesDialog reserve={reserve} />
                        <ReserveRewardsDialog reserve={reserve} />
                      </CardContent>
                    </Card>
                  );
                })}

                {isEditable && <AddReserveDialog />}
              </div>
            </TabsContent>

            <TabsContent value={Tab.RATE_LIMITER} className="mt-0">
              <Card>
                <CardHeader>
                  <TTitle>Rate limiter</TTitle>
                </CardHeader>
                <CardContent className="flex flex-row flex-wrap gap-2">
                  <RateLimiterConfigDialog />
                  <RateLimiterPropertiesDialog />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value={Tab.LIQUIDATE} className="mt-0">
              <Card>
                <CardHeader>
                  <TTitle>Liquidate</TTitle>
                </CardHeader>
                <CardContent className="flex flex-row flex-wrap gap-2">
                  <LiquidateDialog />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value={Tab.OBLIGATIONS} className="mt-0">
              <Card>
                <CardHeader>
                  <TTitle>Obligations</TTitle>
                </CardHeader>
                <CardContent className="flex flex-row flex-wrap gap-2">
                  <ObligationsDialog />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default function Admin() {
  const { suilendClient, data } = useAppContext();
  if (!suilendClient || !data) return <FullPageSpinner />;

  return <Page />;
}
