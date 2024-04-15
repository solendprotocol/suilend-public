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

import { ActionsModalContextProvider } from "@/components/dashboard/actions-modal/ActionsModalContext";
import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { RewardSummary } from "@/lib/liquidityMining";

export type ActionSignature = (
  coinType: string,
  value: string,
) => Promise<SuiTransactionBlockResponse>;

interface DashboardContextValue {
  deposit: ActionSignature;
  borrow: ActionSignature;
  withdraw: ActionSignature;
  repay: ActionSignature;
  claimRewards: (
    rewards: RewardSummary[],
  ) => Promise<SuiTransactionBlockResponse>;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined,
);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardContextProvider",
    );
  }
  return context;
};

export function DashboardContextProvider({ children }: PropsWithChildren) {
  const { address } = useWalletContext();
  const {
    suilendClient,
    data,
    obligation,
    signExecuteAndWaitTransactionBlock,
  } = useAppContext();
  const obligationOwnerCap = data?.obligationOwnerCaps?.find(
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

  const claimRewards = useCallback(
    async (rewards: RewardSummary[]) => {
      if (!address) throw Error("Wallet not connected");
      if (!suilendClient) throw Error("Suilend client not initialized");
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
  const contextValue: DashboardContextValue = useMemo(
    () => ({
      deposit,
      borrow,
      withdraw,
      repay,
      claimRewards,
    }),
    [deposit, borrow, withdraw, repay, claimRewards],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      <ActionsModalContextProvider>{children}</ActionsModalContextProvider>
    </DashboardContext.Provider>
  );
}
