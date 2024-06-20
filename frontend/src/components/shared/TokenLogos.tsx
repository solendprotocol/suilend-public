import TokenLogo from "@/components/shared/TokenLogo";
import { Token } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TokenLogosProps {
  tokens: Token[];
}

export default function TokenLogos({ tokens }: TokenLogosProps) {
  return (
    <div className="relative flex w-max flex-row">
      {tokens.map((token, index) => {
        return (
          <div
            key={index}
            className={cn("relative h-4 w-4", index !== 0 && "-ml-0.5")}
            style={{ zIndex: index }}
          >
            {index !== 0 && (
              <div
                className="absolute -inset-[2px] z-[1] rounded-full transition-colors"
                style={{ backgroundColor: "var(--bg-color)" }}
              />
            )}

            <TokenLogo
              className="relative z-[2] h-4 w-4"
              imageProps={{ className: "rounded-full" }}
              token={token}
            />
          </div>
        );
      })}
    </div>
  );
}
