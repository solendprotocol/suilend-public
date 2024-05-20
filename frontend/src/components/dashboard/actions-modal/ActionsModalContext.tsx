import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
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
  Days,
  DownsampledReserveAssetDataEvent,
  RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP,
} from "@/lib/events";
import { API_URL } from "@/lib/navigation";

export enum Tab {
  DEPOSIT = "deposit",
  BORROW = "borrow",
  WITHDRAW = "withdraw",
  REPAY = "repay",
}

type ReserveAssetDataEventsMap = Record<
  string,
  Record<Days, DownsampledReserveAssetDataEvent[]>
>;

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

  reserveAssetDataEventsMap?: ReserveAssetDataEventsMap;
  fetchReserveAssetDataEvents: (reserveId: string, days: Days) => Promise<void>;
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

  reserveAssetDataEventsMap: undefined,
  fetchReserveAssetDataEvents: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
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

  // ReserveAssetData events
  const [reserveAssetDataEventsMap, setReserveAssetDataEventsMap] = useState<
    ActionsModalContext["reserveAssetDataEventsMap"]
  >(defaultContextValue.reserveAssetDataEventsMap);

  const fetchReserveAssetDataEvents = useCallback(
    async (reserveId: string, days: Days) => {
      try {
        const sampleIntervalS = RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP[days];

        const url = `${API_URL}/events/downsampled-reserve-asset-data?reserveId=${reserveId}&days=${days}&sampleIntervalS=${sampleIntervalS}`;
        const res = await fetch(url);
        const json = (await res.json()) as DownsampledReserveAssetDataEvent[];

        for (const event of json) {
          event.coinType = normalizeStructTag(event.coinType);
        }

        setReserveAssetDataEventsMap((_eventsMap) => ({
          ..._eventsMap,
          [reserveId]: {
            ...((_eventsMap !== undefined && _eventsMap[reserveId]
              ? _eventsMap[reserveId]
              : {}) as Record<Days, DownsampledReserveAssetDataEvent[]>),
            [days]: json,
          },
        }));
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  const suiReserveId = data.lendingMarket.reserves.find((r) =>
    isSui(r.coinType),
  )?.id;

  const didFetchSuiReserveAssetDataEventsRef = useRef<boolean>(false);
  useEffect(() => {
    if (!suiReserveId) return;
    if (didFetchSuiReserveAssetDataEventsRef.current) return;

    for (const days of DAYS) fetchReserveAssetDataEvents(suiReserveId, days);
    didFetchSuiReserveAssetDataEventsRef.current = true;
  }, [suiReserveId, fetchReserveAssetDataEvents]);

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

      reserveAssetDataEventsMap,
      fetchReserveAssetDataEvents,
    }),
    [
      reserveIndex,
      isOpen,
      selectedTab,
      isMoreParametersOpen,
      setIsMoreParametersOpen,
      activePanel,
      reserveAssetDataEventsMap,
      fetchReserveAssetDataEvents,
    ],
  );

  return (
    <ActionsModalContext.Provider value={contextValue}>
      {children}
    </ActionsModalContext.Provider>
  );
}
