import { PropsWithChildren } from "react";

import Container from "@/components/shared/Container";
import { useAppContext } from "@/contexts/AppContext";

type HeaderBaseProps = PropsWithChildren;

export default function HeaderBase({ children }: HeaderBaseProps) {
  const { data } = useAppContext();

  return (
    <>
      <div className="h-[64px] min-h-[64px] w-full" />
      <div
        className="fixed left-0 top-0 z-[2] border-b bg-background"
        style={{ right: "var(--removed-body-scroll-bar-size, 0)" }}
      >
        <Container>
          <div className="flex h-[64px] w-full flex-row items-center justify-between py-1 sm:py-3">
            {data && children}
          </div>
        </Container>
      </div>
    </>
  );
}
