import { PropsWithChildren, useEffect, useState } from "react";

import Container from "@/components/shared/Container";
import { cn } from "@/lib/utils";

type HeaderBaseProps = PropsWithChildren;

export default function HeaderBase({ children }: HeaderBaseProps) {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, 100);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <div className="h-[64px] min-h-[64px] w-full" />
      <div
        className="fixed left-0 top-0 z-[2] border-b bg-background"
        style={{ right: "var(--removed-body-scroll-bar-size, 0)" }}
      >
        <Container>
          <div
            className={cn(
              "flex h-[64px] w-full flex-row items-center justify-between py-1 opacity-0 transition-opacity sm:py-3",
              show && "opacity-100",
            )}
          >
            {children}
          </div>
        </Container>
      </div>
    </>
  );
}
