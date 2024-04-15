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

import { Tab } from "@/components/dashboard/actions-modal/ActionsModal";
import { Panel } from "@/components/dashboard/actions-modal/ParametersPanel";

interface ActionsModalContext {
  selectedTab: Tab;
  setSelectedTab: Dispatch<SetStateAction<Tab>>;
  isMoreParametersOpen: boolean;
  setIsMoreParametersOpen: Dispatch<SetStateAction<boolean>>;
  activePanel: Panel;
  setActivePanel: Dispatch<SetStateAction<Panel>>;
}

const ActionsModalContext = createContext<ActionsModalContext>({
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
  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.DEPOSIT);
  const [isMoreParametersOpen, setIsMoreParametersOpen] =
    useLocalStorage<boolean>("isActionsModalMoreParametersOpen", false);
  const [activePanel, setActivePanel] = useState<Panel>(Panel.LIMITS);

  const contextValue = useMemo(
    () => ({
      selectedTab,
      setSelectedTab,
      isMoreParametersOpen,
      setIsMoreParametersOpen,
      activePanel,
      setActivePanel,
    }),
    [selectedTab, isMoreParametersOpen, setIsMoreParametersOpen, activePanel],
  );

  return (
    <ActionsModalContext.Provider value={contextValue}>
      {children}
    </ActionsModalContext.Provider>
  );
}
