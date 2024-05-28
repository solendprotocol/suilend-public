import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { SuiTransactionBlockResponse } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as Sentry from "@sentry/nextjs";
import { useLocalStorage } from "usehooks-ts";

import { Panel } from "@/components/dashboard/actions-modal/ParametersPanel";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";

export enum Tab {
  DEPOSIT = "deposit",
  BORROW = "borrow",
  WITHDRAW = "withdraw",
  REPAY = "repay",
}

export type ActionSignature = (
  coinType: string,
  value: string,
) => Promise<SuiTransactionBlockResponse>;

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

  deposit: ActionSignature;
  borrow: ActionSignature;
  withdraw: ActionSignature;
  repay: ActionSignature;
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

  deposit: async () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  borrow: async () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  withdraw: async () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  repay: async () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
};

const ActionsModalContext =
  createContext<ActionsModalContext>(defaultContextValue);

export const useActionsModalContext = () => useContext(ActionsModalContext);

export function ActionsModalContextProvider({ children }: PropsWithChildren) {
  const { address } = useWalletContext();
  const {
    suilendClient,
    obligation,
    signExecuteAndWaitTransactionBlock,
    ...restAppContext
  } = useAppContext();
  const data = restAppContext.data as AppData;

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

  // Actions
  const obligationOwnerCap = data.obligationOwnerCaps?.find(
    (o) => o.obligationId === obligation?.id,
  );

  const deposit = useCallback(
    async (coinType: string, value: string) => {
      if (!address) throw Error("Wallet not connected");
      if (!suilendClient) throw Error("Suilend client not initialized");

      const txb = new TransactionBlock();
      try {
        await suilendClient.depositIntoObligation(
          address,
          coinType,
          value,
          txb,
          obligationOwnerCap?.id,
        );
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }

      const res = await signExecuteAndWaitTransactionBlock(txb);
      return res;
    },
    [
      address,
      suilendClient,
      signExecuteAndWaitTransactionBlock,
      obligationOwnerCap,
    ],
  );

  const borrow = useCallback(
    async (coinType: string, value: string) => {
      if (!address) throw Error("Wallet not connected");
      if (!suilendClient) throw Error("Suilend client not initialized");
      if (!obligationOwnerCap || !obligation)
        throw Error("Obligation not found");

      const txb = new TransactionBlock();
      try {
        await suilendClient.borrowFromObligation(
          address,
          obligationOwnerCap.id,
          obligation.id,
          coinType,
          value,
          txb,
        );
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }

      const res = await signExecuteAndWaitTransactionBlock(txb);
      return res;
    },
    [
      address,
      suilendClient,
      signExecuteAndWaitTransactionBlock,
      obligationOwnerCap,
      obligation,
    ],
  );

  const withdraw = useCallback(
    async (coinType: string, value: string) => {
      if (!address) throw Error("Wallet not connected");
      if (!suilendClient) throw Error("Suilend client not initialized");
      if (!obligationOwnerCap || !obligation)
        throw Error("Obligation not found");

      const txb = new TransactionBlock();
      try {
        await suilendClient.withdrawFromObligation(
          address,
          obligationOwnerCap.id,
          obligation.id,
          coinType,
          value,
          txb,
        );
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }

      const res = await signExecuteAndWaitTransactionBlock(txb);
      return res;
    },
    [
      address,
      suilendClient,
      signExecuteAndWaitTransactionBlock,
      obligationOwnerCap,
      obligation,
    ],
  );

  const repay = useCallback(
    async (coinType: string, value: string) => {
      if (!address) throw Error("Wallet not connected");
      if (!suilendClient) throw Error("Suilend client not initialized");
      if (!obligation) throw Error("Obligation not found");

      const txb = new TransactionBlock();
      try {
        await suilendClient.repayIntoObligation(
          address,
          obligation.id,
          coinType,
          value,
          txb,
        );
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }

      const res = await signExecuteAndWaitTransactionBlock(txb);
      return res;
    },
    [address, suilendClient, signExecuteAndWaitTransactionBlock, obligation],
  );

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

      deposit,
      borrow,
      withdraw,
      repay,
    }),
    [
      reserveIndex,
      isOpen,
      selectedTab,
      isMoreParametersOpen,
      setIsMoreParametersOpen,
      activePanel,
      deposit,
      borrow,
      withdraw,
      repay,
    ],
  );

  return (
    <ActionsModalContext.Provider value={contextValue}>
      {children}
    </ActionsModalContext.Provider>
  );
}
