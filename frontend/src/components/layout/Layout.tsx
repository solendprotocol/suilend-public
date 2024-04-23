import { CSSProperties, PropsWithChildren, useRef, useState } from "react";

import { useFlags } from "launchdarkly-react-client-sdk";
import { useResizeObserver } from "usehooks-ts";

import AppHeader from "@/components/layout/AppHeader";
import Banner from "@/components/layout/Banner";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import { useAppContext } from "@/contexts/AppContext";

export default function Layout({ children }: PropsWithChildren) {
  const { suilendClient, data } = useAppContext();
  const flags = useFlags();

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

  const isHeaderLoading =
    flags.banner === undefined ||
    (flags.banner?.message && [0, null].includes(bannerHeight));

  const isPageLoading = isHeaderLoading || !suilendClient || !data;

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
      {(isHeaderLoading || isPageLoading) && <FullPageSpinner />}

      <Banner
        ref={bannerRef}
        height={bannerHeight}
        isHidden={isHeaderLoading}
      />
      {!isHeaderLoading && <AppHeader />}

      <div className="relative z-[1] flex-1 py-4 md:py-6">
        {!isPageLoading && <Container>{children}</Container>}
      </div>

      <Footer />
    </div>
  );
}
