import { useRouter } from "next/router";
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
import { cloneDeep } from "lodash";
import { useLocalStorage } from "usehooks-ts";

import { SuilendClient } from "@suilend/sdk/client";

import { ParametersPanelTab } from "@/components/dashboard/actions-modal/ParametersPanel";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { shallowPushQuery } from "@/lib/router";

enum QueryParams {
  RESERVE_INDEX = "assetIndex",
  TAB = "action",
  PARAMETERS_PANEL_TAB = "parametersPanelTab",
}

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
  isOpen: boolean;
  open: (reserveIndex: number) => void;
  close: () => void;
  reserveIndex?: number;

  selectedTab: Tab;
  onSelectedTabChange: (tab: Tab) => void;
  isMoreParametersOpen: boolean;
  setIsMoreParametersOpen: Dispatch<SetStateAction<boolean>>;
  selectedParametersPanelTab: ParametersPanelTab;
  onSelectedParametersPanelTabChange: (tab: ParametersPanelTab) => void;

  deposit: ActionSignature;
  borrow: ActionSignature;
  withdraw: ActionSignature;
  repay: ActionSignature;
}

const defaultContextValue: ActionsModalContext = {
  isOpen: false,
  open: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  close: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  reserveIndex: undefined,

  selectedTab: Tab.DEPOSIT,
  onSelectedTabChange: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  isMoreParametersOpen: false,
  setIsMoreParametersOpen: () => {
    throw Error("ActionsModalContextProvider not initialized");
  },
  selectedParametersPanelTab: ParametersPanelTab.ADVANCED,
  onSelectedParametersPanelTabChange: () => {
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
  const router = useRouter();
  const queryParams = {
    [QueryParams.RESERVE_INDEX]: router.query[QueryParams.RESERVE_INDEX] as
      | string
      | undefined,
    [QueryParams.TAB]: router.query[QueryParams.TAB] as Tab | undefined,
    [QueryParams.PARAMETERS_PANEL_TAB]: router.query[
      QueryParams.PARAMETERS_PANEL_TAB
    ] as ParametersPanelTab | undefined,
  };

  const { address } = useWalletContext();
  const { obligation, signExecuteAndWaitTransactionBlock, ...restAppContext } =
    useAppContext();
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;
  const data = restAppContext.data as AppData;

  // Open
  const [isOpen, setIsOpen] = useState<boolean>(
    queryParams[QueryParams.RESERVE_INDEX] !== undefined,
  );

  const open = useCallback(
    (_reserveIndex: number) => {
      setIsOpen(true);

      shallowPushQuery(router, {
        ...router.query,
        [QueryParams.RESERVE_INDEX]: _reserveIndex,
      });
    },
    [router],
  );
  const close = useCallback(() => {
    setIsOpen(false);

    setTimeout(() => {
      const restQuery = cloneDeep(router.query);
      delete restQuery[QueryParams.RESERVE_INDEX];
      shallowPushQuery(router, restQuery);
    }, 250);
  }, [router]);

  // Reserve index
  const reserveIndex =
    queryParams[QueryParams.RESERVE_INDEX] !== undefined
      ? +queryParams[QueryParams.RESERVE_INDEX]
      : defaultContextValue.reserveIndex;

  // Tab
  const selectedTab =
    queryParams[QueryParams.TAB] &&
    Object.values(Tab).includes(queryParams[QueryParams.TAB])
      ? queryParams[QueryParams.TAB]
      : defaultContextValue.selectedTab;
  const onSelectedTabChange = useCallback(
    (tab: Tab) => {
      shallowPushQuery(router, { ...router.query, [QueryParams.TAB]: tab });
    },
    [router],
  );

  // More parameters
  const [isMoreParametersOpen, setIsMoreParametersOpen] = useLocalStorage<
    ActionsModalContext["isMoreParametersOpen"]
  >(
    "isActionsModalMoreParametersOpen",
    defaultContextValue.isMoreParametersOpen,
  );

  const selectedParametersPanelTab =
    queryParams[QueryParams.PARAMETERS_PANEL_TAB] &&
    Object.values(ParametersPanelTab).includes(
      queryParams[QueryParams.PARAMETERS_PANEL_TAB],
    )
      ? queryParams[QueryParams.PARAMETERS_PANEL_TAB]
      : defaultContextValue.selectedParametersPanelTab;
  const onSelectedParametersPanelTabChange = useCallback(
    (tab: ParametersPanelTab) => {
      shallowPushQuery(router, {
        ...router.query,
        [QueryParams.PARAMETERS_PANEL_TAB]: tab,
      });
    },
    [router],
  );

  // Actions
  const obligationOwnerCap = data.obligationOwnerCaps?.find(
    (o) => o.obligationId === obligation?.id,
  );

  const deposit = useCallback(
    async (coinType: string, value: string) => {
      if (!address) throw Error("Wallet not connected");

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
      isOpen: isOpen && reserveIndex !== undefined,
      open,
      close,
      reserveIndex,

      selectedTab,
      onSelectedTabChange,
      isMoreParametersOpen,
      setIsMoreParametersOpen,
      selectedParametersPanelTab,
      onSelectedParametersPanelTabChange,

      deposit,
      borrow,
      withdraw,
      repay,
    }),
    [
      isOpen,
      reserveIndex,
      open,
      close,
      selectedTab,
      onSelectedTabChange,
      isMoreParametersOpen,
      setIsMoreParametersOpen,
      selectedParametersPanelTab,
      onSelectedParametersPanelTabChange,
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
