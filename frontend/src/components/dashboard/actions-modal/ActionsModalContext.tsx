import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import { useLocalStorage } from "usehooks-ts";

import { Panel } from "@/components/dashboard/actions-modal/ParametersPanel";

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
}

const ActionsModalContext = createContext<ActionsModalContext>({
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
});

export const useActionsModalContext = () => {
  const context = useContext(ActionsModalContext);
  if (!context) {
    throw new Error(
      "useActionsModalContext must be used within a ActionsModalContextProvider",
    );
  }
  return context;
};

export function ActionsModalContextProvider({ children }: PropsWithChildren) {
  const [reserveIndex, setReserveIndex] = useState<number | undefined>(
    undefined,
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.DEPOSIT);
  const [isMoreParametersOpen, setIsMoreParametersOpen] =
    useLocalStorage<boolean>("isActionsModalMoreParametersOpen", false);
  const [activePanel, setActivePanel] = useState<Panel>(Panel.LIMITS);

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
    }),
    [
      reserveIndex,
      isOpen,
      selectedTab,
      isMoreParametersOpen,
      setIsMoreParametersOpen,
      activePanel,
    ],
  );

  return (
    <ActionsModalContext.Provider value={contextValue}>
      {children}
    </ActionsModalContext.Provider>
  );
}
