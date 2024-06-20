import { ClassValue } from "clsx";

import TokenLogo from "@/components/shared/TokenLogo";
import { Token } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TokenLogosProps {
  className?: ClassValue;
  tokens: Token[];
}

export default function TokenLogos({ className, tokens }: TokenLogosProps) {
  const marginLeft =
    className && className.toString().includes("h-4") ? -0.5 : -1;

  return (
    <div className="relative flex w-max flex-row">
      {tokens.map((token, index) => {
        return (
          <div
            key={index}
            className={cn("relative", className)}
            style={{
              zIndex: index,
              marginLeft: index !== 0 ? `${marginLeft * 4}px` : 0,
            }}
          >
            {index !== 0 && (
              <div
                className="absolute -inset-[2px] z-[1] rounded-full transition-colors"
                style={{
                  backgroundColor: "var(--bg-color, hsl(var(--background)))",
                }}
              />
            )}

            <TokenLogo
              className={cn("relative z-[2]", className)}
              imageProps={{ className: "rounded-full" }}
              token={token}
            />
          </div>
        );
      })}
    </div>
  );
}
