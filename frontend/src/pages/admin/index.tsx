import Head from "next/head";
import { useRouter } from "next/router";

import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";

import { SuilendClient } from "@suilend/sdk/client";

import AddReserveDialog from "@/components/admin/AddReserveDialog";
import LiquidateDialog from "@/components/admin/LiquidateDialog";
import ObligationsDialog from "@/components/admin/ObligationsDialog";
import RateLimiterConfigDialog from "@/components/admin/RateLimiterConfigDialog";
import RateLimiterPropertiesDialog from "@/components/admin/RateLimiterPropertiesDialog";
import ReserveConfigDialog from "@/components/admin/ReserveConfigDialog";
import ReservePropertiesDialog from "@/components/admin/ReservePropertiesDialog";
import ReserveRewardsDialog from "@/components/admin/ReserveRewardsDialog";
import Button from "@/components/shared/Button";
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
import { AppData, useAppContext } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

function Page() {
  const router = useRouter();
  const tab = router.query.tab as string | undefined;

  const {
    refreshData,
    explorer,
    signExecuteAndWaitTransactionBlock,
    ...restAppContext
  } = useAppContext();
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;
  const data = restAppContext.data as AppData;

  const isEditable = !!data.lendingMarketOwnerCapId;

  // Tabs
  enum Tab {
    LENDING_MARKET = "lendingMarket",
    RESERVES = "reserves",
    RATE_LIMITER = "rateLimiter",
    LIQUIDATE = "liquidate",
    OBLIGATIONS = "obligations",
  }

  const tabs = [
    [
      { id: Tab.LENDING_MARKET, title: "Lending market" },
      { id: Tab.RESERVES, title: "Reserves" },
      { id: Tab.RATE_LIMITER, title: "Rate limiter" },
    ],
    [
      { id: Tab.LIQUIDATE, title: "Liquidate" },
      { id: Tab.OBLIGATIONS, title: "Obligations" },
    ],
  ];

  const selectedTab =
    tab && Object.values(Tab).includes(tab as Tab)
      ? (tab as Tab)
      : Tab.LENDING_MARKET;
  const onSelectedTabChange = (tab: Tab) => {
    router.push({ query: { tab } });
  };

  // Lending market
  const onMigrate = async () => {
    if (!data.lendingMarketOwnerCapId)
      throw new Error("Error: No lending market owner cap");

    const txb = new TransactionBlock();

    try {
      try {
        suilendClient.migrate(txb, data.lendingMarketOwnerCapId);
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }

      await signExecuteAndWaitTransactionBlock(txb);

      toast.success("Migrated");
    } catch (err) {
      toast.error("Failed to migrate", {
        description: ((err as Error)?.message || err) as string,
      });
    } finally {
      await refreshData();
    }
  };

  return (
    <>
      <Head>
        <title>Suilend Admin</title>
      </Head>

      <div className="flex w-full flex-col items-center">
        <div className="flex w-full max-w-[800px] flex-col">
          <div className="mb-4 flex flex-col">
            {tabs.map((tabsRow, index) => (
              <Tabs
                key={index}
                tabs={tabsRow}
                selectedTab={selectedTab}
                onTabChange={(tab) => onSelectedTabChange(tab as Tab)}
                listClassName={cn(
                  "mb-0",
                  index !== 0 && "rounded-t-none",
                  index !== tabs.length - 1 && "border-b-0 rounded-b-none",
                )}
              />
            ))}
          </div>

          {selectedTab === Tab.LENDING_MARKET && (
            <Card>
              <CardHeader>
                <TTitle className="uppercase">Lending market</TTitle>
              </CardHeader>
              <CardContent className="flex flex-row flex-wrap gap-2">
                <Button onClick={onMigrate} disabled={!isEditable}>
                  Migrate
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedTab === Tab.RESERVES && (
            <div className="flex w-full flex-col gap-2">
              {data.lendingMarket.reserves.map((reserve) => {
                return (
                  <Card key={reserve.id}>
                    <CardHeader>
                      <TTitle className="uppercase">{reserve.symbol}</TTitle>
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

              <AddReserveDialog />
            </div>
          )}

          {selectedTab === Tab.RATE_LIMITER && (
            <Card>
              <CardHeader>
                <TTitle className="uppercase">Rate limiter</TTitle>
              </CardHeader>
              <CardContent className="flex flex-row flex-wrap gap-2">
                <RateLimiterConfigDialog />
                <RateLimiterPropertiesDialog />
              </CardContent>
            </Card>
          )}

          {selectedTab === Tab.LIQUIDATE && (
            <Card>
              <CardHeader>
                <TTitle className="uppercase">Liquidate</TTitle>
              </CardHeader>
              <CardContent className="flex flex-row flex-wrap gap-2">
                <LiquidateDialog />
              </CardContent>
            </Card>
          )}

          {selectedTab === Tab.OBLIGATIONS && (
            <Card>
              <CardHeader>
                <TTitle className="uppercase">Obligations</TTitle>
              </CardHeader>
              <CardContent className="flex flex-row flex-wrap gap-2">
                <ObligationsDialog />
              </CardContent>
            </Card>
          )}
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
