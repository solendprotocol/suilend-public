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
        src="https://www.unpkg.com/@wormhole-foundation/wormhole-connect@0.3.3/dist/main.js"
        integrity="sha384-be7tSjGKf3akqV+FFKLt4241MoVYmg6rZKe9k3uQLePzk4lEY0t9VZvLjduwsVgG"
        onLoad={() => setIsLoading(false)}
      />
      {children}
    </WormholeConnectContext.Provider>
  );
}
