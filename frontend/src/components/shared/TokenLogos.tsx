import { Fragment } from "react";

import TokenLogo from "@/components/shared/TokenLogo";
import { cn } from "@/lib/utils";

interface TokenLogoProps {
  tokens: {
    coinType: string;
    symbol: string;
    src?: string | null;
  }[];
  bgColor?: string;
}

export default function TokenLogos({ tokens, bgColor }: TokenLogoProps) {
  return (
    <div className="flex w-max flex-row">
      {tokens.map((token, index) => {
        return (
          <Fragment key={index}>
            <TokenLogo
              className={cn(
                "relative h-4 w-4 rounded-full transition-shadow",
                index !== 0 && "bg-shadow-2px -ml-0.5",
              )}
              style={{
                zIndex: index * 2,
                boxShadow:
                  index !== 0
                    ? `0 0 0 2px ${bgColor || "hsl(var(--background))"}`
                    : "none",
              }}
              coinType={token.coinType}
              symbol={token.symbol}
              src={token.src}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
