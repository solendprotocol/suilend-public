import { CSSProperties, PropsWithChildren, useRef, useState } from "react";

import { useResizeObserver } from "usehooks-ts";

import AppHeader from "@/components/layout/AppHeader";
import Banner from "@/components/layout/Banner";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import { useAppContext } from "@/contexts/AppContext";

export default function Layout({ children }: PropsWithChildren) {
  const { suilendClient, data } = useAppContext();

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

  const isPageLoading = !suilendClient || !data;

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
      <AppHeader />

      {isPageLoading && <FullPageSpinner />}
      <div className="relative z-[1] flex-1 py-4 md:py-6">
        {!isPageLoading && <Container>{children}</Container>}
      </div>

      <Footer />
    </div>
  );
}
