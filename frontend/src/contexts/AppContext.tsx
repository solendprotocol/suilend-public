import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
} from "react";

import {
  CoinBalance,
  CoinMetadata,
  SuiClient,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

import { ObligationOwnerCap } from "@suilend/sdk/_generated/suilend/lending-market/structs";
import { SuilendClient } from "@suilend/sdk/client";
import { ParsedLendingMarket } from "@suilend/sdk/parsers/lendingMarket";
import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import { useWalletContext } from "@/contexts/WalletContext";
import useFetchAppData from "@/fetchers/useFetchAppData";
import { ParsedCoinBalance } from "@/lib/coinBalance";
import { EXPLORERS, RPCS } from "@/lib/constants";
import { RewardMap } from "@/lib/liquidityMining";
import { PointsStats } from "@/lib/points";

export interface AppData {
  lendingMarket: ParsedLendingMarket;
  lendingMarketOwnerCapId: string | undefined;
  obligationOwnerCaps: ObligationOwnerCap<string>[] | undefined;
  obligations: ParsedObligation[] | undefined;
  coinBalancesMap: Record<string, ParsedCoinBalance>;
  coinMetadataMap: Record<string, CoinMetadata>;
  rewardMap: RewardMap;
  pointsStats: PointsStats;
  coinBalancesRaw: CoinBalance[];
}

export interface AppContextValue {
  suiClient: SuiClient | null;
  suilendClient: SuilendClient<string> | null;
  data: AppData | null;
  refreshData: () => Promise<void>;
  rpc: (typeof RPCS)[number];
  setRpcId: (value: string) => void;
  explorer: (typeof EXPLORERS)[number];
  setExplorerId: (value: string) => void;
  obligation: ParsedObligation | null;
  setObligationId: Dispatch<SetStateAction<string | null>>;
  signExecuteAndWaitTransactionBlock: (
    txb: TransactionBlock,
  ) => Promise<SuiTransactionBlockResponse>;
}

const defaultContextValues: AppContextValue = {
  suiClient: null,
  suilendClient: null,
  data: null,
  refreshData: async () => {
    throw Error("AppContextProvider not initialized");
  },
  rpc: RPCS[0],
  setRpcId: () => {
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
  signExecuteAndWaitTransactionBlock: () => {
    throw Error("AppContextProvider not initialized");
  },
};

const AppContext = createContext<AppContextValue>(defaultContextValues);

export const useAppContext = () => useContext(AppContext);

export function AppContextProvider({ children }: PropsWithChildren) {
  const { address, signExecuteAndWaitTransactionBlock } = useWalletContext();

  // RPC
  const [rpcId, setRpcId] = useLocalStorage<string>(
    "selectedRpc",
    defaultContextValues.rpc.id,
  );
  const rpc = RPCS.find((rpc) => rpc.id === rpcId) ?? RPCS[0];

  // Explorer
  const [explorerId, setExplorerId] = useLocalStorage<string>(
    "selectedExplorer",
    defaultContextValues.explorer.id,
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

  // Obligation
  const [obligationId, setObligationId] = useLocalStorage<string | null>(
    "obligationId",
    null,
  );

  // Context
  const contextValue: AppContextValue = useMemo(
    () => ({
      suiClient,
      suilendClient,
      data: data ?? null,
      refreshData: async () => {
        await mutateData();
      },
      rpc,
      setRpcId: async (value: string) => {
        const newRpc = RPCS.find((r) => r.id === value);
        if (!newRpc) return;

        setRpcId(value);
        await mutateData();
        toast.info(`Switched RPC to ${newRpc.name}`);
      },
      explorer,
      setExplorerId: (value: string) => {
        const newExplorer = EXPLORERS.find((e) => e.id === value);
        if (!newExplorer) return;

        setExplorerId(value);
        toast.info(`Switched explorer to ${newExplorer.name}`);
      },
      obligation:
        data?.obligations?.find(
          (obligation) => obligation.id === obligationId,
        ) ??
        data?.obligations?.[0] ??
        null,
      setObligationId,
      signExecuteAndWaitTransactionBlock: (txb: TransactionBlock) =>
        signExecuteAndWaitTransactionBlock(suiClient, txb),
    }),
    [
      suiClient,
      suilendClient,
      data,
      mutateData,
      rpc,
      setRpcId,
      explorer,
      setExplorerId,
      obligationId,
      setObligationId,
      signExecuteAndWaitTransactionBlock,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
