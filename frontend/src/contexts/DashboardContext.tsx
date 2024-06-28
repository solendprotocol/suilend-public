import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { SuiTransactionBlockResponse } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as Sentry from "@sentry/nextjs";

import { SuilendClient } from "@suilend/sdk/client";

import { ActionsModalContextProvider } from "@/components/dashboard/actions-modal/ActionsModalContext";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { RewardSummary } from "@/lib/liquidityMining";

interface DashboardContext {
  claimRewards: (
    rewards: RewardSummary[],
  ) => Promise<SuiTransactionBlockResponse>;
}

const defaultContextValue: DashboardContext = {
  claimRewards: async () => {
    throw Error("DashboardContextProvider not initialized");
  },
};

const DashboardContext = createContext<DashboardContext>(defaultContextValue);

export const useDashboardContext = () => useContext(DashboardContext);

export function DashboardContextProvider({ children }: PropsWithChildren) {
  const { address } = useWalletContext();
  const { obligation, signExecuteAndWaitTransactionBlock, ...restAppContext } =
    useAppContext();
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;
  const data = restAppContext.data as AppData;

  const obligationOwnerCap = data.obligationOwnerCaps?.find(
    (o) => o.obligationId === obligation?.id,
  );

  const claimRewards = useCallback(
    async (rewards: RewardSummary[]) => {
      if (!address) throw Error("Wallet not connected");
      if (!obligationOwnerCap || !obligation)
        throw Error("Obligation not found");

      const txb = new TransactionBlock();
      try {
        await suilendClient.claimRewardsToObligation(
          address,
          rewards.map((r) => {
            const obligationClaim = r.obligationClaims[obligation.id];

            return {
              obligationOwnerCapId: obligationOwnerCap.id,
              reserveArrayIndex: obligationClaim.reserveArrayIndex,
              rewardIndex: BigInt(r.stats.rewardIndex),
              rewardType: r.stats.rewardCoinType,
              side: r.stats.side,
            };
          }),
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

  // Context
  const contextValue: DashboardContext = useMemo(
    () => ({
      claimRewards,
    }),
    [claimRewards],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      <ActionsModalContextProvider>{children}</ActionsModalContextProvider>
    </DashboardContext.Provider>
  );
}
