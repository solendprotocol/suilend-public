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
} from "react";

import {
  CoinBalance,
  CoinMetadata,
  SuiClient,
  SuiTransactionBlockResponse,
} from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { isEqual } from "lodash";
import { useLocalStorage } from "usehooks-ts";

import { ObligationOwnerCap } from "@suilend/sdk/_generated/suilend/lending-market/structs";
import { SuilendClient } from "@suilend/sdk/client";
import { ParsedLendingMarket } from "@suilend/sdk/parsers/lendingMarket";
import { ParsedObligation } from "@suilend/sdk/parsers/obligation";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import { useWalletContext } from "@/contexts/WalletContext";
import useFetchAppData from "@/fetchers/useFetchAppData";
import { ParsedCoinBalance } from "@/lib/coinBalance";
import { EXPLORERS, Explorer, RPCS, Rpc } from "@/lib/constants";
import { RewardMap } from "@/lib/liquidityMining";

export interface AppData {
  lendingMarket: ParsedLendingMarket;
  lendingMarketOwnerCapId: string | undefined;
  reserveMap: Record<string, ParsedReserve>;
  obligationOwnerCaps: ObligationOwnerCap<string>[] | undefined;
  obligations: ParsedObligation[] | undefined;
  coinBalancesMap: Record<string, ParsedCoinBalance>;
  coinMetadataMap: Record<string, CoinMetadata>;
  rewardMap: RewardMap;
  coinBalancesRaw: CoinBalance[];
}

export interface AppContext {
  suiClient: SuiClient | null;
  suilendClient: SuilendClient<string> | null;
  data: AppData | null;
  refreshData: () => Promise<void>;
  rpc: (typeof RPCS)[number];
  customRpcUrl: string;
  setRpc: (id: Rpc, customUrl: string) => void;
  explorer: (typeof EXPLORERS)[number];
  setExplorerId: (id: Explorer) => void;
  obligation: ParsedObligation | null;
  setObligationId: Dispatch<SetStateAction<string | null>>;
  signExecuteAndWaitTransaction: (
    transaction: Transaction,
  ) => Promise<SuiTransactionBlockResponse>;
}

const defaultContextValue: AppContext = {
  suiClient: null,
  suilendClient: null,
  data: null,
  refreshData: async () => {
    throw Error("AppContextProvider not initialized");
  },
  rpc: RPCS[0],
  customRpcUrl: "",
  setRpc: () => {
    throw Error("AppContextProvider not initialized");
  },
  explorer: EXPLORERS[0],
  setExplorerId: () => {
    throw Error("AppContextProvider not initialized");
  },
  obligation: null,
  setObligationId: () => {
    throw Error("AppContextProvider not initialized");
  },
  signExecuteAndWaitTransaction: () => {
    throw Error("AppContextProvider not initialized");
  },
};

const AppContext = createContext<AppContext>(defaultContextValue);

export const useAppContext = () => useContext(AppContext);

export function AppContextProvider({ children }: PropsWithChildren) {
  const { address, signExecuteAndWaitTransaction } = useWalletContext();

  // RPC
  const [rpcId, setRpcId] = useLocalStorage<string>(
    "selectedRpc",
    defaultContextValue.rpc.id,
  );
  const [customRpcUrl, setCustomRpcUrl] = useLocalStorage<string>(
    "customRpcUrl",
    defaultContextValue.customRpcUrl,
  );

  const rpc = useMemo(
    () =>
      rpcId === Rpc.CUSTOM
        ? { id: Rpc.CUSTOM, name: "Custom", url: customRpcUrl }
        : RPCS.find((rpc) => rpc.id === rpcId) ?? RPCS[0],
    [rpcId, customRpcUrl],
  );

  // Explorer
  const [explorerId, setExplorerId] = useLocalStorage<string>(
    "selectedExplorer",
    defaultContextValue.explorer.id,
  );
  const explorer =
    EXPLORERS.find((explorer) => explorer.id === explorerId) ?? EXPLORERS[0];

  // Sui client
  const suiClient = useMemo(() => new SuiClient({ url: rpc.url }), [rpc.url]);

  // Suilend client & app data
  const {
    data,
    mutate: mutateData,
    suilendClient,
  } = useFetchAppData(suiClient, address);

  const refreshData = useCallback(async () => {
    await mutateData();
  }, [mutateData]);

  // Obligation
  const [obligationId, setObligationId] = useLocalStorage<string | null>(
    "obligationId",
    null,
  );

  // Poll for balance changes
  // const unsubscribeRef = useRef<(() => void) | undefined>(undefined);
  const previousBalancesRef = useRef<CoinBalance[] | undefined>(undefined);
  useEffect(() => {
    // if (unsubscribeRef.current !== undefined) {
    //   unsubscribeRef.current();
    //   unsubscribeRef.current = undefined;
    // }
    previousBalancesRef.current = undefined;

    if (!address) return;
    if (!suiClient) return;

    // suiClient
    //   .subscribeTransaction({
    //     filter: {
    //       FromAddress: address,
    //     },
    //     onMessage: async (event: TransactionEffects) => {
    //       await refreshData();
    //     },
    //   })
    //   .then((unsubscribe) => {
    //     unsubscribeRef.current = unsubscribe;
    //   });

    const interval = setInterval(async () => {
      try {
        const balances = await suiClient.getAllBalances({
          owner: address,
        });

        if (
          previousBalancesRef.current !== undefined &&
          !isEqual(balances, previousBalancesRef.current)
        )
          await refreshData();
        previousBalancesRef.current = balances;
      } catch (err) {
        console.error(err);
      }
    }, 1000 * 5);

    return () => {
      // if (unsubscribeRef.current !== undefined) {
      //   unsubscribeRef.current();
      //   unsubscribeRef.current = undefined;
      // }
      if (interval !== undefined) clearInterval(interval);
    };
  }, [address, suiClient, refreshData]);

  // Context
  const contextValue: AppContext = useMemo(
    () => ({
      suiClient,
      suilendClient,
      data: data ?? null,
      refreshData,
      rpc,
      customRpcUrl,
      setRpc: (id: Rpc, customUrl: string) => {
        setRpcId(id);
        if (id === Rpc.CUSTOM) setCustomRpcUrl(customUrl);

        setTimeout(() => refreshData(), 100); // Wait for suiClient to update
      },
      explorer,
      setExplorerId: (id: Explorer) => setExplorerId(id),
      obligation:
        data?.obligations?.find(
          (obligation) => obligation.id === obligationId,
        ) ??
        data?.obligations?.[0] ??
        null,
      setObligationId,
      signExecuteAndWaitTransaction: (transaction: Transaction) =>
        signExecuteAndWaitTransaction(suiClient, transaction),
    }),
    [
      suiClient,
      suilendClient,
      data,
      refreshData,
      rpc,
      customRpcUrl,
      setRpcId,
      setCustomRpcUrl,
      explorer,
      setExplorerId,
      obligationId,
      setObligationId,
      signExecuteAndWaitTransaction,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
