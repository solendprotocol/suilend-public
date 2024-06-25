import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SuiTransactionBlockResponse } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as Sentry from "@sentry/nextjs";
import pLimit from "p-limit";

import { fetchDownsampledApiReserveAssetDataEvents } from "@suilend/sdk/api/events";
import { SuilendClient } from "@suilend/sdk/client";
import {
  ParsedDownsampledApiReserveAssetDataEvent,
  parseDownsampledApiReserveAssetDataEvent,
} from "@suilend/sdk/parsers/apiReserveAssetDataEvent";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import { ActionsModalContextProvider } from "@/components/dashboard/actions-modal/ActionsModalContext";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { DAYS, Days, RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP } from "@/lib/events";
import { RewardSummary } from "@/lib/liquidityMining";

type ReserveAssetDataEventsMap = Record<
  string,
  Record<Days, ParsedDownsampledApiReserveAssetDataEvent[]>
>;

interface DashboardContext {
  claimRewards: (
    rewards: RewardSummary[],
  ) => Promise<SuiTransactionBlockResponse>;

  reserveAssetDataEventsMap?: ReserveAssetDataEventsMap;
  fetchReserveAssetDataEvents: (
    reserve: ParsedReserve,
    days: Days,
  ) => Promise<void>;
}

const defaultContextValue: DashboardContext = {
  claimRewards: async () => {
    throw Error("DashboardContextProvider not initialized");
  },

  reserveAssetDataEventsMap: undefined,
  fetchReserveAssetDataEvents: async () => {
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

  // Actions
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

  // ReserveAssetData events
  const [reserveAssetDataEventsMap, setReserveAssetDataEventsMap] = useState<
    DashboardContext["reserveAssetDataEventsMap"]
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

  // Prefetch
  const didFetchReserveAssetDataEventsRef = useRef<boolean>(false);
  useEffect(() => {
    if (didFetchReserveAssetDataEventsRef.current) return;

    const limit = pLimit(3);
    for (const reserve of data.lendingMarket.reserves) {
      for (const days of DAYS)
        limit(async () => await fetchReserveAssetDataEvents(reserve, days));
    }
    didFetchReserveAssetDataEventsRef.current = true;
  }, [data.lendingMarket.reserves, fetchReserveAssetDataEvents]);

  // Context
  const contextValue: DashboardContext = useMemo(
    () => ({
      claimRewards,

      reserveAssetDataEventsMap,
      fetchReserveAssetDataEvents,
    }),
    [claimRewards, reserveAssetDataEventsMap, fetchReserveAssetDataEvents],
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      <ActionsModalContextProvider>{children}</ActionsModalContextProvider>
    </DashboardContext.Provider>
  );
}
