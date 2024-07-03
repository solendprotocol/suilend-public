import TokenLogo from "@/components/shared/TokenLogo";
import { TLabelSans } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";

interface LoopedPositionProps {
  coinTypes: string[];
}

export default function LoopedPosition({ coinTypes }: LoopedPositionProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  return (
    <div className="flex flex-row flex-wrap items-center gap-x-1.5 gap-y-1">
      <TokenLogo
        className="h-4 w-4"
        token={{
          coinType: coinTypes[0],
          symbol: data.coinMetadataMap[coinTypes[0]].symbol,
          iconUrl: data.coinMetadataMap[coinTypes[0]].iconUrl,
        }}
      />
      <TLabelSans>
        {data.coinMetadataMap[coinTypes[0]].symbol} deposits{" "}
        {coinTypes[0] === coinTypes[1] ? "and borrows" : "and"}
      </TLabelSans>
      {coinTypes[0] !== coinTypes[1] && (
        <>
          <TokenLogo
            className="h-4 w-4"
            token={{
              coinType: coinTypes[1],
              symbol: data.coinMetadataMap[coinTypes[1]].symbol,
              iconUrl: data.coinMetadataMap[coinTypes[1]].iconUrl,
            }}
          />
          <TLabelSans>
            {data.coinMetadataMap[coinTypes[1]].symbol} borrows
          </TLabelSans>
        </>
      )}
    </div>
  );
}
