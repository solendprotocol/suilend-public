import { useRouter } from "next/router";
import { CSSProperties, PropsWithChildren, useRef, useState } from "react";

import { useResizeObserver } from "usehooks-ts";

import WormholeConnect from "@/components/bridge/WormholeConnect";
import AccountDetailsDialog from "@/components/dashboard/account-details/AccountDetailsDialog";
import AppHeader from "@/components/layout/AppHeader";
import Banner from "@/components/layout/Banner";
import Footer from "@/components/layout/Footer";
import LaunchDarklyBanner from "@/components/layout/LaunchDarklyBanner";
import LoopingDialog from "@/components/layout/LoopingDialog";
import Container from "@/components/shared/Container";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import { useAppContext } from "@/contexts/AppContext";
import { ReserveAssetDataEventsContextProvider } from "@/contexts/ReserveAssetDataEventsContext";
import { useWormholeConnectContext } from "@/contexts/WormholeConnectContext";
import { BRIDGE_URL, ROOT_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export const SUI_WALLET_CAMPAIGN_DEPOSIT_MIN_USD = 50;

export enum QueryParams {
  SUI_WALLET_CAMPAIGN = "sui-wallet-campaign",
}

export default function Layout({ children }: PropsWithChildren) {
  const router = useRouter();
  const queryParams = {
    [QueryParams.SUI_WALLET_CAMPAIGN]: router.query[
      QueryParams.SUI_WALLET_CAMPAIGN
    ] as string | undefined,
  };
  const { suilendClient, data } = useAppContext();
  const { isLoading: isWormholeConnectLoading } = useWormholeConnectContext();

  // Launch Darkly banner
  const launchDarklyBannerRef = useRef<HTMLDivElement>(null);
  const [launchDarklyBannerHeight, setLaunchDarklyBannerHeight] = useState<
    number | null
  >(null);

  useResizeObserver<HTMLDivElement>({
    ref: launchDarklyBannerRef,
    onResize: ({ height }) => {
      if (height === undefined) return;
      setLaunchDarklyBannerHeight(height);
    },
  });

  // Sui Wallet campaign banner
  const suiWalletCampaignBannerRef = useRef<HTMLDivElement>(null);
  const [suiWalletCampaignBannerHeight, setSuiWalletCampaignBannerHeight] =
    useState<number | null>(null);

  useResizeObserver<HTMLDivElement>({
    ref: suiWalletCampaignBannerRef,
    onResize: ({ height }) => {
      if (height === undefined) return;
      setSuiWalletCampaignBannerHeight(height);
    },
  });

  // Loading
  const isOnLandingPage = router.asPath === ROOT_URL;
  const isOnBridgePage = router.asPath.startsWith(BRIDGE_URL);

  const isDataLoading = !suilendClient || !data;
  const isPageLoading = isOnLandingPage
    ? false
    : !isOnBridgePage
      ? isDataLoading
      : isDataLoading || isWormholeConnectLoading;

  return (
    <div
      className="relative z-[1] flex min-h-dvh flex-col"
      style={
        {
          background: "url('/assets/footer.svg') bottom no-repeat",
          "--header-top": `${(launchDarklyBannerHeight ?? 0) + (suiWalletCampaignBannerHeight ?? 0)}px`,
        } as CSSProperties
      }
    >
      <LaunchDarklyBanner
        ref={launchDarklyBannerRef}
        height={launchDarklyBannerHeight}
      />
      <Banner
        ref={suiWalletCampaignBannerRef}
        style={{ top: launchDarklyBannerHeight ?? 0 }}
        message={`Deposit $${SUI_WALLET_CAMPAIGN_DEPOSIT_MIN_USD} for a chance to win a Capsule! Campaign ends August 13.`}
        height={suiWalletCampaignBannerHeight}
        isHidden={queryParams[QueryParams.SUI_WALLET_CAMPAIGN] === undefined}
      />
      {!isOnLandingPage && <AppHeader />}

      {isPageLoading && <FullPageSpinner />}
      <div
        className={cn(
          "relative z-[1] flex-1",
          !isOnLandingPage && "py-4 md:py-6",
        )}
      >
        {!isOnLandingPage ? (
          <Container>
            {!isPageLoading && (
              <ReserveAssetDataEventsContextProvider>
                {children}

                <AccountDetailsDialog />
                <LoopingDialog />
              </ReserveAssetDataEventsContextProvider>
            )}
          </Container>
        ) : (
          children
        )}
        <WormholeConnect isHidden={!isOnBridgePage || isPageLoading} />
      </div>

      {!isOnLandingPage && <Footer />}
    </div>
  );
}
