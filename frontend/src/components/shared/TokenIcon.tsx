import Image from "next/image";

import { ClassValue } from "clsx";

import TextLink from "@/components/shared/TextLink";
import Tooltip from "@/components/shared/Tooltip";
import { TLabelSans } from "@/components/shared/Typography";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LOGO_MAP, NORMALIZED_USDT_ET_COINTYPE } from "@/lib/coinType";
import { NORMALIZED_USDC_ET_COINTYPE } from "@/lib/coinType";
import { DOCS_BRIDGE_LEARN_MORE_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface TokenIconProps {
  className?: ClassValue;
  coinType: string;
  symbol: string;
  url?: string | null;
}

export default function TokenIcon({
  className,
  coinType,
  symbol,
  url,
}: TokenIconProps) {
  const nativeAssetMap = {
    [NORMALIZED_USDC_ET_COINTYPE]: {
      fullName: "Wormhole Wrapped Ethereum-native USDC",
    },
    [NORMALIZED_USDT_ET_COINTYPE]: {
      fullName: "Wormhole Wrapped Ethereum-native USDT",
    },
  };
  const nativeAsset = nativeAssetMap[coinType];

  return (
    <Tooltip
      content={
        nativeAsset ? (
          <TLabelSans className="text-foreground">
            {`${nativeAsset.fullName}. `}
            <TextLink href={DOCS_BRIDGE_LEARN_MORE_URL}>Learn more</TextLink>
          </TLabelSans>
        ) : undefined
      }
    >
      <div className={cn("relative h-7 w-7", className)}>
        <AspectRatio ratio={1} className="relative z-[1]">
          {url ? (
            <Image
              src={url}
              alt={`${symbol} logo`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full rounded-full bg-gray-200" />
          )}
        </AspectRatio>

        {nativeAsset && (
          <div className="absolute -bottom-0.5 -right-0.5 z-[2] rounded-full border border-background bg-background">
            <Image
              src={LOGO_MAP.WORMHOLE}
              width={12}
              height={12}
              alt="Wormhole logo"
            />
          </div>
        )}
      </div>
    </Tooltip>
  );
}
