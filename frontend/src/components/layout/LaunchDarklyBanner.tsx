import { forwardRef } from "react";

import { useFlags } from "launchdarkly-react-client-sdk";

import Banner from "@/components/layout/Banner";

interface LaunchDarklyBannerProps {
  height: number | null;
}

const LaunchDarklyBanner = forwardRef<HTMLDivElement, LaunchDarklyBannerProps>(
  ({ height }, ref) => {
    const flags = useFlags();

    const { icon, isLinkRelative, link, linkTitle, message } =
      flags?.banner || {};
    console.log(
      "XXX LaunchDarklyBanner",
      flags?.banner,
      flags?.banner ? Object.keys(flags.banner).length : "--",
      icon,
      isLinkRelative,
      link,
      linkTitle,
      message,
    );

    return (
      <Banner
        ref={ref}
        icon={icon}
        isLinkRelative={isLinkRelative}
        link={link}
        linkTitle={linkTitle}
        message={message}
        height={height}
        isHidden={!flags?.banner || Object.keys(flags.banner).length === 0}
      />
    );
  },
);
LaunchDarklyBanner.displayName = "LaunchDarklyBanner";

export default LaunchDarklyBanner;
