import { useRouter } from "next/router";
import { CSSProperties, PropsWithChildren, useRef, useState } from "react";

import { useResizeObserver } from "usehooks-ts";

import WormholeConnect from "@/components/bridge/WormholeConnect";
import AppHeader from "@/components/layout/AppHeader";
import Banner from "@/components/layout/Banner";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import { useAppContext } from "@/contexts/AppContext";
import { useWormholeConnectContext } from "@/contexts/WormholeConnectContext";
import { BRIDGE_URL, ROOT_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export default function Layout({ children }: PropsWithChildren) {
  const router = useRouter();
  const { suilendClient, data } = useAppContext();
  const { isLoading: isWormholeConnectLoading } = useWormholeConnectContext();

  // Banner
  const bannerRef = useRef<HTMLDivElement>(null);
  const [bannerHeight, setBannerHeight] = useState<number | null>(null);

  useResizeObserver<HTMLDivElement>({
    ref: bannerRef,
    onResize: ({ height }) => {
      if (height === undefined) return;
      setBannerHeight(height);
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
      className="relative flex min-h-dvh flex-col"
      style={
        {
          background: "url('/footer.svg') bottom no-repeat",
          "--header-top": `${bannerHeight ?? 0}px`,
        } as CSSProperties
      }
    >
      <Banner ref={bannerRef} height={bannerHeight} />
      {!isOnLandingPage && <AppHeader />}

      {isPageLoading && <FullPageSpinner />}
      <div
        className={cn(
          "relative z-[1] flex-1",
          !isOnLandingPage && "py-4 md:py-6",
        )}
      >
        {!isOnLandingPage ? (
          <Container>{!isPageLoading && children}</Container>
        ) : (
          children
        )}
        <WormholeConnect isHidden={!isOnBridgePage || isPageLoading} />
      </div>

      {!isOnLandingPage && <Footer />}
    </div>
  );
}
