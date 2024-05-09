import { PropsWithChildren } from "react";

import { ClassValue } from "clsx";

import Container from "@/components/shared/Container";
import { cn } from "@/lib/utils";

interface HeaderBaseProps extends PropsWithChildren {
  className?: ClassValue;
}

export default function HeaderBase({ className, children }: HeaderBaseProps) {
  const headerHeight = 64;

  return (
    <>
      <div
        className={cn("w-full flex-shrink-0", className)}
        style={{ height: `${headerHeight}px` }}
      />
      <div
        className={cn("fixed left-0 z-[2] border-b bg-background", className)}
        style={{
          top: "var(--header-top)",
          right: "var(--removed-body-scroll-bar-size, 0)",
        }}
      >
        <Container>
          <div
            className="flex w-full flex-row items-center justify-between gap-4"
            style={{ height: `${headerHeight}px` }}
          >
            {children}
          </div>
        </Container>
      </div>
    </>
  );
}
