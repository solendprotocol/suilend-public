import { PropsWithChildren } from "react";

import AppHeader from "@/components/layout/AppHeader";
import Footer from "@/components/layout/Footer";
import Container from "@/components/shared/Container";

interface LayoutProps extends PropsWithChildren {
  hideBackground?: boolean;
}

export default function Layout({ hideBackground, children }: LayoutProps) {
  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{
        background: !hideBackground
          ? "url('/assets/footer.svg') bottom no-repeat"
          : undefined,
      }}
    >
      <AppHeader />
      <div className="relative z-[1] flex-1 py-4 md:py-6">
        <Container>{children}</Container>
      </div>

      <Footer />
    </div>
  );
}
