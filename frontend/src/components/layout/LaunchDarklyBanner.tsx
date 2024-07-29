import { forwardRef } from "react";

import { useFlags } from "launchdarkly-react-client-sdk";

import Banner from "@/components/layout/Banner";

interface LaunchDarklyBannerProps {
  height: number | null;
}

const LaunchDarklyBanner = forwardRef<HTMLDivElement, LaunchDarklyBannerProps>(
  ({ height }, ref) => {
    const flags = useFlags();

    if (!flags?.banner || Object.keys(flags.banner).length === 0) return null;
    return (
      <Banner
        ref={ref}
        icon={flags.banner.icon}
        isLinkRelative={flags.banner.isLinkRelative}
        link={flags.banner.link}
        linkTitle={flags.banner.linkTitle}
        message={flags.banner.message}
        isHidden={flags.banner.message && [0, null].includes(height)}
        height={height}
      />
    );
  },
);
LaunchDarklyBanner.displayName = "LaunchDarklyBanner";

export default LaunchDarklyBanner;
