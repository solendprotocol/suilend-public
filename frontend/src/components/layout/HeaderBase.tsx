import { PropsWithChildren } from "react";

import Container from "@/components/shared/Container";

export default function HeaderBase({ children }: PropsWithChildren) {
  const headerHeight = 64;

  return (
    <>
      <div className="w-full" style={{ height: `${headerHeight}px` }} />
      <div
        className="fixed left-0 z-[2] border-b bg-background"
        style={{
          top: "var(--header-top)",
          right: "var(--removed-body-scroll-bar-size, 0)",
        }}
      >
        <Container>
          <div
            className="flex w-full flex-row items-center justify-between"
            style={{ height: `${headerHeight}px` }}
          >
            {children}
          </div>
        </Container>
      </div>
    </>
  );
}
