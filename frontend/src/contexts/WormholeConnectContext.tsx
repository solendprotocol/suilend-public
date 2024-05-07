import Script from "next/script";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

interface WormholeConnectContextValue {
  isLoading: boolean;
}

const WormholeConnectContext = createContext<
  WormholeConnectContextValue | undefined
>(undefined);

export const useWormholeConnectContext = () => {
  const context = useContext(WormholeConnectContext);
  if (!context) {
    throw new Error(
      "useWormholeConnectContext must be used within a WormholeConnectContextProvider",
    );
  }
  return context;
};

export function WormholeConnectContextProvider({
  children,
}: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Context
  const contextValue: WormholeConnectContextValue = useMemo(
    () => ({
      isLoading,
    }),
    [isLoading],
  );

  return (
    <WormholeConnectContext.Provider value={contextValue}>
      <Script
        type="module"
        src="https://bt70tedhyxrom6ou.public.blob.vercel-storage.com/wormhole-connect@0.3.7-TxUXxgQRGaBAkWLNE54czD16ZJqdku.js"
        onLoad={() => setIsLoading(false)}
      />
      {children}
    </WormholeConnectContext.Provider>
  );
}
