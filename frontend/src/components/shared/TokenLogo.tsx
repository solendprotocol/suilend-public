import Image from "next/image";
import { CSSProperties } from "react";

import { ClassValue } from "clsx";

import TextLink from "@/components/shared/TextLink";
import Tooltip from "@/components/shared/Tooltip";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  NORMALIZED_ETH_COINTYPE,
  NORMALIZED_USDT_COINTYPE,
} from "@/lib/coinType";
import { NORMALIZED_USDC_COINTYPE } from "@/lib/coinType";
import { DOCS_BRIDGE_LEARN_MORE_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import wormholeLogo from "@/public/assets/wormhole.png";

interface TokenLogoProps {
  className?: ClassValue;
  style?: CSSProperties;
  showTooltip?: boolean;
  coinType: string;
  symbol: string;
  src?: string | null;
}

export default function TokenLogo({
  className,
  style,
  showTooltip,
  coinType,
  symbol,
  src,
}: TokenLogoProps) {
  const nativeAssetMap: Record<string, string> = {
    [NORMALIZED_USDC_COINTYPE]: "Wormhole Wrapped Ethereum-native USDC",
    [NORMALIZED_USDT_COINTYPE]: "Wormhole Wrapped Ethereum-native USDT",
    [NORMALIZED_ETH_COINTYPE]: "Wormhole Wrapped Ethereum-native Ethereum",
  };
  const nativeAsset = nativeAssetMap[coinType];

  const isSmall = className
    ? className.toString().includes("h-4") ||
      className.toString().includes("h-5") ||
      className.toString().includes("h-6")
    : false;
  const wormholeLogoSize = isSmall ? 8 : 12;

  return (
    <Tooltip
      title={
        showTooltip && nativeAsset ? (
          <>
            {`${nativeAsset}. `}
            <TextLink href={DOCS_BRIDGE_LEARN_MORE_URL}>Learn more</TextLink>
          </>
        ) : undefined
      }
    >
      <div className={cn("relative h-7 w-7", className)} style={style}>
        <AspectRatio ratio={1} className="relative z-[1]">
          {src ? (
            <Image
              className="object-cover"
              src={src}
              alt={`${symbol} logo`}
              fill
            />
          ) : (
            <div className="h-full w-full rounded-full bg-gray-200" />
          )}
        </AspectRatio>

        {nativeAsset && (
          <div className="absolute -bottom-0.5 -right-0.5 z-[2] rounded-full border border-background bg-background">
            <Image
              src={wormholeLogo}
              alt="Wormhole logo"
              width={wormholeLogoSize}
              height={wormholeLogoSize}
            />
          </div>
        )}
      </div>
    </Tooltip>
  );
}
