import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import BigNumber from "bignumber.js";

import { Obligation } from "@suilend/sdk/_generated/suilend/obligation/structs";
import {
  ParsedObligation,
  parseObligation,
} from "@suilend/sdk/parsers/obligation";
import * as simulate from "@suilend/sdk/utils/simulate";

import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatRewards } from "@/lib/liquidityMining";
import { getPointsRewards, getPointsStats } from "@/lib/points";

export interface LeaderboardRowData {
  rank: number;
  address: string;
  pointsPerDay: BigNumber;
  totalPoints: BigNumber;
}

type ObligationWithOwner = Obligation<string> & {
  owner: string;
};

export interface PointsContextValue {
  rawObligations?: ObligationWithOwner[];
  rawObligationsUpdatedAt?: Date;
  leaderboardRows?: LeaderboardRowData[];
  rank?: number | null;
}

const defaultContextValues: PointsContextValue = {
  rawObligations: undefined,
  rawObligationsUpdatedAt: undefined,
  leaderboardRows: undefined,
  rank: undefined,
};

const PointsContext = createContext<PointsContextValue>(defaultContextValues);

export const usePointsContext = () => useContext(PointsContext);

export function PointsContextProvider({ children }: PropsWithChildren) {
  const { address } = useWalletContext();
  const { data } = useAppContext();

  // Obligations
  const [rawObligations, setRawObligations] = useState<
    PointsContextValue["rawObligations"]
  >(defaultContextValues["rawObligations"]);
  const [rawObligationsUpdatedAt, setRawObligationsUpdatedAt] = useState<
    PointsContextValue["rawObligationsUpdatedAt"]
  >(defaultContextValues["rawObligationsUpdatedAt"]);

  const isFetchingObligationsRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingObligationsRef.current) return;

      isFetchingObligationsRef.current = true;
      try {
        const res = await fetch("/api/obligations");
        const json = await res.json();

        setRawObligations(json.obligations);
        setRawObligationsUpdatedAt(new Date(json.updatedAt * 1000));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [data]);

  // Leaderboard
  const [leaderboardRows, setLeaderboardRows] = useState<
    PointsContextValue["leaderboardRows"]
  >(defaultContextValues["leaderboardRows"]);

  const isProcessingLeaderboardRowsRef = useRef<boolean>(false);
  useEffect(() => {
    if (rawObligations === undefined) return;
    if (data === null) return;
    if (isProcessingLeaderboardRowsRef.current) return;

    isProcessingLeaderboardRowsRef.current = true;

    const obligations = (rawObligations || [])
      .map((rawObligation) =>
        simulate.refreshObligation(rawObligation, data.refreshedRawReserves),
      )
      .map((refreshedObligation) =>
        parseObligation(refreshedObligation, data.reserveMap),
      );

    type AddressObligationMap = Record<string, ParsedObligation[]>;
    const addressObligations = obligations.reduce((acc, obligation) => {
      const owner = (obligation.original as ObligationWithOwner).owner;
      if (acc[owner] === undefined) acc[owner] = [];
      acc[owner].push(obligation);
      return acc;
    }, {} as AddressObligationMap);

    const rawRows = Object.entries(addressObligations).map(
      ([owner, obligations]) => {
        const rewardMap = formatRewards(
          data.reserveMap,
          data.coinMetadataMap,
          obligations,
        );
        const pointsRewards = getPointsRewards(rewardMap);
        const pointsStats = getPointsStats(pointsRewards, obligations);

        return {
          address: owner,
          totalPoints: pointsStats.totalPoints.total,
          pointsPerDay: pointsStats.pointsPerDay.total,
        };
      },
    );

    setLeaderboardRows(
      rawRows
        .filter((row) => row.totalPoints.gt(0))
        .sort((a, b) => (b.totalPoints.gt(a.totalPoints) ? 1 : -1))
        .map((row, index) => ({ ...row, rank: index + 1 })),
    );
  }, [rawObligations, data]);

  // Rank
  const [rank, setRank] = useState<PointsContextValue["rank"]>(
    defaultContextValues["rank"],
  );

  useEffect(() => {
    if (!address || leaderboardRows === undefined) {
      setRank(undefined);
      return;
    }

    const row = leaderboardRows.find((row) => row.address === address);
    if (row === undefined) {
      setRank(null);
      return;
    }

    setRank(row.rank);
  }, [address, leaderboardRows]);

  // Context
  const contextValue: PointsContextValue = useMemo(
    () => ({
      rawObligationsUpdatedAt,
      leaderboardRows,
      rank,
    }),
    [rawObligationsUpdatedAt, leaderboardRows, rank],
  );

  return (
    <PointsContext.Provider value={contextValue}>
      {children}
    </PointsContext.Provider>
  );
}
