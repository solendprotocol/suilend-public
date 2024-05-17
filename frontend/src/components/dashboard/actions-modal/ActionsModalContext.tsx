import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import { useLocalStorage } from "usehooks-ts";

import { Panel } from "@/components/dashboard/actions-modal/ParametersPanel";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { isSui } from "@/lib/coinType";
import {
  DAYS,
  DownsampledReserveAssetDataEvent,
  RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP,
  SuiReserveEventMap,
} from "@/lib/events";
import { API_URL } from "@/lib/navigation";

export enum Tab {
  DEPOSIT = "deposit",
  BORROW = "borrow",
  WITHDRAW = "withdraw",
  REPAY = "repay",
}

interface ActionsModalContext {
  reserveIndex?: number;
  isOpen: boolean;
  open: (reserveIndex: number) => void;
  close: () => void;

  selectedTab: Tab;
  setSelectedTab: Dispatch<SetStateAction<Tab>>;
  isMoreParametersOpen: boolean;
  setIsMoreParametersOpen: Dispatch<SetStateAction<boolean>>;
  activePanel: Panel;
  setActivePanel: Dispatch<SetStateAction<Panel>>;

  suiReserveEventMap?: SuiReserveEventMap;
}

const defaultContextValue: ActionsModalContext = {
  reserveIndex: undefined,
  isOpen: false,
  open: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  close: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },

  selectedTab: Tab.DEPOSIT,
  setSelectedTab: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  isMoreParametersOpen: false,
  setIsMoreParametersOpen: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  activePanel: Panel.LIMITS,
  setActivePanel: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },

  suiReserveEventMap: undefined,
};

const ActionsModalContext =
  createContext<ActionsModalContext>(defaultContextValue);

export const useActionsModalContext = () => useContext(ActionsModalContext);

export function ActionsModalContextProvider({ children }: PropsWithChildren) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  // Index
  const [reserveIndex, setReserveIndex] = useState<
    ActionsModalContext["reserveIndex"]
  >(defaultContextValue.reserveIndex);
  const [isOpen, setIsOpen] = useState<ActionsModalContext["isOpen"]>(
    defaultContextValue.isOpen,
  );

  // Tabs
  const [selectedTab, setSelectedTab] = useState<
    ActionsModalContext["selectedTab"]
  >(defaultContextValue.selectedTab);
  const [isMoreParametersOpen, setIsMoreParametersOpen] = useLocalStorage<
    ActionsModalContext["isMoreParametersOpen"]
  >(
    "isActionsModalMoreParametersOpen",
    defaultContextValue.isMoreParametersOpen,
  );
  const [activePanel, setActivePanel] = useState<
    ActionsModalContext["activePanel"]
  >(defaultContextValue.activePanel);

  // Sui reserve event map
  const [suiReserveEventMap, setSuiReserveEventMap] = useState<
    ActionsModalContext["suiReserveEventMap"]
  >(defaultContextValue.suiReserveEventMap);

  const suiReserveId = data.lendingMarket.reserves.find((r) =>
    isSui(r.coinType),
  )?.id;

  const isFetchingEventsRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingEventsRef.current) return;

      isFetchingEventsRef.current = true;
      try {
        const urls = Object.entries(RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP).map(
          ([days, sampleIntervalS]) =>
            `${API_URL}/events/downsampled-reserve-asset-data?reserveId=${suiReserveId}&days=${days}&sampleIntervalS=${sampleIntervalS}`,
        );
        const res = await Promise.all(urls.map((url) => fetch(url)));
        const json = (await Promise.all(
          res.map((r) => r.json()),
        )) as DownsampledReserveAssetDataEvent[][];

        for (const event of [...json[0], ...json[1], ...json[2]]) {
          event.coinType = normalizeStructTag(event.coinType);
        }

        setSuiReserveEventMap(
          DAYS.reduce(
            (acc, days, index) => ({ ...acc, [days]: json[index] }),
            {},
          ) as ActionsModalContext["suiReserveEventMap"],
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, [suiReserveId]);

  // Context
  const contextValue = useMemo(
    () => ({
      reserveIndex,
      isOpen: isOpen && reserveIndex !== undefined,
      open: (_reserveIndex: number) => {
        setIsOpen(true);
        setReserveIndex(_reserveIndex);
      },
      close: () => {
        setIsOpen(false);
      },

      selectedTab,
      setSelectedTab,
      isMoreParametersOpen,
      setIsMoreParametersOpen,
      activePanel,
      setActivePanel,

      suiReserveEventMap,
    }),
    [
      reserveIndex,
      isOpen,
      selectedTab,
      isMoreParametersOpen,
      setIsMoreParametersOpen,
      activePanel,
      suiReserveEventMap,
    ],
  );

  return (
    <ActionsModalContext.Provider value={contextValue}>
      {children}
    </ActionsModalContext.Provider>
  );
}
