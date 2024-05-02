import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAppContext } from "@/contexts/AppContext";

export const AUTO_REFRESH_DATA_INTERVAL = 30; // Seconds

interface RefreshDataContextValue {
  autoRefreshCountdown: number;
  manuallyRefreshData: () => Promise<void>;
  isRefreshing: boolean;
}

const RefreshDataContext = createContext<RefreshDataContextValue | undefined>(
  undefined,
);

export const useRefreshDataContext = () => {
  const context = useContext(RefreshDataContext);
  if (!context) {
    throw new Error(
      "useRefreshDataContext must be used within a RefreshDataContextProvider",
    );
  }
  return context;
};

export function RefreshDataContextProvider({ children }: PropsWithChildren) {
  const { refreshData: silentlyRefreshData } = useAppContext();

  const isRefreshingRef = useRef<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Countdown
  const [countdown, setCountdown] = useState<number>(
    AUTO_REFRESH_DATA_INTERVAL,
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pauseCountdown = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const resumeCountdown = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((time) => (time > 0.25 ? time - 0.25 : 0));
    }, 0.25 * 1000);
  }, []);

  const startCountdown = useCallback(() => {
    pauseCountdown();

    setCountdown(AUTO_REFRESH_DATA_INTERVAL);
    resumeCountdown();
  }, [pauseCountdown, resumeCountdown]);

  useEffect(() => {
    startCountdown();

    const onVisibilityChange = () => {
      if (isRefreshingRef.current) return;

      if (document.visibilityState === "hidden") pauseCountdown();
      else startCountdown();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [startCountdown, pauseCountdown]);

  // Refresh
  const refreshData = useCallback(async () => {
    if (isRefreshingRef.current) return;

    (async () => {
      isRefreshingRef.current = true;
      setIsRefreshing(true);

      pauseCountdown();
      await silentlyRefreshData();
      startCountdown();

      isRefreshingRef.current = false;
      setIsRefreshing(false);
    })();
  }, [pauseCountdown, silentlyRefreshData, startCountdown]);

  useEffect(() => {
    if (countdown !== 0) return;
    if (isRefreshingRef.current) return;

    refreshData();
  }, [countdown, refreshData]);

  // Context
  const contextValue: RefreshDataContextValue = useMemo(
    () => ({
      autoRefreshCountdown: countdown,
      manuallyRefreshData: refreshData,
      isRefreshing,
    }),
    [refreshData, countdown, isRefreshing],
  );

  return (
    <RefreshDataContext.Provider value={contextValue}>
      {children}
    </RefreshDataContext.Provider>
  );
}
