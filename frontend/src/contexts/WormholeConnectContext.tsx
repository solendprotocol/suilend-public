import Script from "next/script";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

interface WormholeConnectContext {
  isLoading: boolean;
}

const defaultContextValue: WormholeConnectContext = {
  isLoading: true,
};

const WormholeConnectContext =
  createContext<WormholeConnectContext>(defaultContextValue);

export const useWormholeConnectContext = () =>
  useContext(WormholeConnectContext);

export function WormholeConnectContextProvider({
  children,
}: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState<
    WormholeConnectContext["isLoading"]
  >(defaultContextValue.isLoading);

  // Context
  const contextValue: WormholeConnectContext = useMemo(
    () => ({
      isLoading,
    }),
    [isLoading],
  );

  return (
    <WormholeConnectContext.Provider value={contextValue}>
      <Script
        type="module"
        src="https://bt70tedhyxrom6ou.public.blob.vercel-storage.com/wormhole-connect@0.3.7/main.js"
        onLoad={() => setIsLoading(false)}
      />
      {children}
    </WormholeConnectContext.Provider>
  );
}
