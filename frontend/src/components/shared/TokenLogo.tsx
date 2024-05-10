import Image from "next/image";

import { ClassValue } from "clsx";

import TextLink from "@/components/shared/TextLink";
import Tooltip from "@/components/shared/Tooltip";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { NORMALIZED_USDT_ET_COINTYPE } from "@/lib/coinType";
import { NORMALIZED_USDC_ET_COINTYPE } from "@/lib/coinType";
import { DOCS_BRIDGE_LEARN_MORE_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import wormholeLogo from "@/public/assets/wormhole.png";

interface TokenLogoProps {
  className?: ClassValue;
  showTooltip?: boolean;
  coinType: string;
  symbol: string;
  src?: string | null;
}

export default function TokenLogo({
  className,
  showTooltip,
  coinType,
  symbol,
  src,
}: TokenLogoProps) {
  const nativeAssetMap = {
    [NORMALIZED_USDC_ET_COINTYPE]: {
      fullName: "Wormhole Wrapped Ethereum-native USDC",
    },
    [NORMALIZED_USDT_ET_COINTYPE]: {
      fullName: "Wormhole Wrapped Ethereum-native USDT",
    },
  };
  const nativeAsset = nativeAssetMap[coinType];

  const isSmall = className ? className.toString().includes("h-4") : false;
  const wormholeLogoSize = isSmall ? 8 : 12;

  return (
    <Tooltip
      title={
        showTooltip && nativeAsset ? (
          <>
            {`${nativeAsset.fullName}. `}
            <TextLink href={DOCS_BRIDGE_LEARN_MORE_URL}>Learn more</TextLink>
          </>
        ) : undefined
      }
    >
      <div className={cn("relative h-7 w-7", className)}>
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
