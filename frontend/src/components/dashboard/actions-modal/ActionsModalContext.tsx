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

import { useLocalStorage } from "usehooks-ts";

import { fetchDownsampledApiReserveAssetDataEvents } from "@suilend/sdk/api/events";
import {
  ParsedDownsampledApiReserveAssetDataEvent,
  parseDownsampledApiReserveAssetDataEvent,
} from "@suilend/sdk/parsers/apiReserveAssetDataEvent";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import { Panel } from "@/components/dashboard/actions-modal/ParametersPanel";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { NORMALIZED_SUI_COINTYPE } from "@/lib/coinType";
import { DAYS, Days, RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP } from "@/lib/events";

export enum Tab {
  DEPOSIT = "deposit",
  BORROW = "borrow",
  WITHDRAW = "withdraw",
  REPAY = "repay",
}

type ReserveAssetDataEventsMap = Record<
  string,
  Record<Days, ParsedDownsampledApiReserveAssetDataEvent[]>
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
  fetchReserveAssetDataEvents: (
    reserve: ParsedReserve,
    days: Days,
  ) => Promise<void>;
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
    async (reserve: ParsedReserve, days: Days) => {
      try {
        const sampleIntervalS = RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP[days];

        const events = await fetchDownsampledApiReserveAssetDataEvents(
          reserve.id,
          days,
          sampleIntervalS,
        );
        const parsedEvents = events.map((event) =>
          parseDownsampledApiReserveAssetDataEvent(event, reserve),
        );

        setReserveAssetDataEventsMap((_eventsMap) => ({
          ..._eventsMap,
          [reserve.id]: {
            ...((_eventsMap !== undefined && _eventsMap[reserve.id]
              ? _eventsMap[reserve.id]
              : {}) as Record<
              Days,
              ParsedDownsampledApiReserveAssetDataEvent[]
            >),
            [days]: parsedEvents,
          },
        }));
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  const suiReserve = data.reserveMap[NORMALIZED_SUI_COINTYPE];

  const didFetchSuiReserveAssetDataEventsRef = useRef<boolean>(false);
  useEffect(() => {
    if (!suiReserve) return;
    if (didFetchSuiReserveAssetDataEventsRef.current) return;

    for (const days of DAYS) fetchReserveAssetDataEvents(suiReserve, days);
    didFetchSuiReserveAssetDataEventsRef.current = true;
  }, [suiReserve, fetchReserveAssetDataEvents]);

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
