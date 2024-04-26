import "@/lib/abortSignalPolyfill";

import type { AppProps } from "next/app";
import Head from "next/head";
import { ReactNode, useEffect } from "react";

import { WalletProvider } from "@suiet/wallet-kit";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LDProvider } from "launchdarkly-react-client-sdk";
import mixpanel from "mixpanel-browser";

import Layout from "@/components/layout/Layout";
import Toaster from "@/components/shared/Toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContextProvider } from "@/contexts/AppContext";
import { PointsContextProvider } from "@/contexts/PointsContext";
import { RefreshAppDataContextProvider } from "@/contexts/RefreshAppDataContext";
import { WalletContextProvider } from "@/contexts/WalletContext";
import { fontClassNames } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import "@suiet/wallet-kit/style.css";
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps,
}: AppProps & {
  Component: AppProps["Component"] & {
    getLayout?: (page: ReactNode) => ReactNode;
  };
}) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  // Mixpanel
  useEffect(() => {
    const projectToken = process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN;
    if (!projectToken) return;

    mixpanel.init(projectToken, {
      debug: process.env.NEXT_PUBLIC_DEBUG === "true",
      persistence: "localStorage",
    });
  }, []);

  return (
    <>
      <SpeedInsights />
      <Analytics />
      <Head>
        <title>Suilend</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </Head>

      <main id="__app_main" className={cn("light", ...fontClassNames)}>
        <TooltipProvider>
          <LDProvider
            clientSideID={
              process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SIDE_ID as string
            }
          >
            <WalletProvider>
              <WalletContextProvider>
                <AppContextProvider>
                  <RefreshAppDataContextProvider>
                    <PointsContextProvider>
                      {getLayout(<Component {...pageProps} />)}
                    </PointsContextProvider>
                  </RefreshAppDataContextProvider>
                </AppContextProvider>
              </WalletContextProvider>
            </WalletProvider>
          </LDProvider>
          <Toaster />
        </TooltipProvider>
      </main>
    </>
  );
}
