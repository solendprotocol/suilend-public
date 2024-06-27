import { forwardRef } from "react";

import { useFlags } from "launchdarkly-react-client-sdk";
import { ArrowLeftRight, Info, LucideIcon } from "lucide-react";

import Container from "@/components/shared/Container";
import TextLink from "@/components/shared/TextLink";
import { TBodySans } from "@/components/shared/Typography";
import { cn } from "@/lib/utils";

interface BannerProps {
  height: number | null;
}

const Banner = forwardRef<HTMLDivElement, BannerProps>(({ height }, ref) => {
  const flags = useFlags();

  const IconMap: Record<string, LucideIcon> = {
    info: Info,
    arrowLeftRight: ArrowLeftRight,
  };

  const Icon = flags.banner?.icon
    ? IconMap[flags.banner.icon as keyof typeof IconMap]
    : null;

  const isHidden = flags.banner?.message && [0, null].includes(height);

  return (
    <>
      <div className="w-full" style={{ height: `${height ?? 0}px` }} />
      <div
        ref={ref}
        className={cn(
          "fixed left-0 top-0 z-[3] bg-secondary",
          isHidden && "opacity-0",
        )}
        style={{ right: "var(--removed-body-scroll-bar-size, 0)" }}
      >
        {flags.banner?.message && (
          <Container>
            <div className="flex w-full flex-row justify-between gap-4 py-2">
              <div className="flex flex-row gap-2">
                {Icon && (
                  <Icon className="my-0.5 h-4 w-4 shrink-0 text-secondary-foreground" />
                )}

                <TBodySans className="text-secondary-foreground">
                  {flags.banner.message}
                </TBodySans>
              </div>

              {flags.banner.link && (
                <TextLink
                  className="hover:decoration-none block shrink-0 text-sm !text-secondary-foreground decoration-secondary-foreground"
                  href={flags.banner.link}
                >
                  {flags.banner.linkTitle || "Learn more"}
                </TextLink>
              )}
            </div>
          </Container>
        )}
      </div>
    </>
  );
});
Banner.displayName = "Banner";

export default Banner;
