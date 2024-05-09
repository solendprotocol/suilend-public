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
import { strFromU8, unzlibSync } from "fflate";

import { Obligation } from "@suilend/sdk/_generated/suilend/obligation/structs";
import {
  ParsedObligation,
  parseObligation,
} from "@suilend/sdk/parsers/obligation";

import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatRewards } from "@/lib/liquidityMining";
import { API_URL } from "@/lib/navigation";
import { getPointsStats, roundPoints } from "@/lib/points";

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
  refreshedObligations?: ObligationWithOwner[];
  refreshedObligationsUpdatedAt?: Date;
  leaderboardRows?: LeaderboardRowData[];
  rank?: number | null;
}

const defaultContextValues: PointsContextValue = {
  refreshedObligations: undefined,
  refreshedObligationsUpdatedAt: undefined,
  leaderboardRows: undefined,
  rank: undefined,
};

const PointsContext = createContext<PointsContextValue>(defaultContextValues);

export const usePointsContext = () => useContext(PointsContext);

export function PointsContextProvider({ children }: PropsWithChildren) {
  const { address } = useWalletContext();
  const { data } = useAppContext();

  // Obligations
  const [refreshedObligations, setRefreshedObligations] = useState<
    PointsContextValue["refreshedObligations"]
  >(defaultContextValues["refreshedObligations"]);
  const [refreshedObligationsUpdatedAt, setRefreshedObligationsUpdatedAt] =
    useState<PointsContextValue["refreshedObligationsUpdatedAt"]>(
      defaultContextValues["refreshedObligationsUpdatedAt"],
    );

  const isFetchingObligationsRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingObligationsRef.current) return;

      isFetchingObligationsRef.current = true;
      try {
        const url = `${API_URL}/obligations/all?compressed=true`;

        const res = await fetch(url);
        const compressedJson = await res.json();
        const json = JSON.parse(
          strFromU8(unzlibSync(Buffer.from(compressedJson.data, "base64"))),
        );

        setRefreshedObligations(json.obligations);
        setRefreshedObligationsUpdatedAt(new Date(json.updatedAt * 1000));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [data]);

  // Leaderboard
  const [leaderboardRows, setLeaderboardRows] = useState<
    PointsContextValue["leaderboardRows"]
  >(defaultContextValues["leaderboardRows"]);

  const isProcessingLeaderboardRowsRef = useRef<boolean>(false);
  useEffect(() => {
    if (refreshedObligations === undefined) return;
    if (data === null) return;
    if (isProcessingLeaderboardRowsRef.current) return;

    isProcessingLeaderboardRowsRef.current = true;

    const obligations = (refreshedObligations || []).map(
      (refreshedObligation) =>
        parseObligation(refreshedObligation, data.reserveMap),
    );

    type AddressObligationMap = Record<string, ParsedObligation[]>;
    const addressObligations = obligations.reduce((acc, obligation) => {
      const owner = (obligation.original as ObligationWithOwner).owner;
      if (acc[owner] === undefined) acc[owner] = [];
      acc[owner].push(obligation);
      return acc;
    }, {} as AddressObligationMap);

    const sortedRows: LeaderboardRowData[] = Object.entries(addressObligations)
      .map(([owner, obligations]) => {
        const rewardMap = formatRewards(
          data.reserveMap,
          data.coinMetadataMap,
          obligations,
        );
        const pointsStats = getPointsStats(rewardMap, obligations);

        return {
          address: owner,
          totalPoints: pointsStats.totalPoints.total,
          pointsPerDay: pointsStats.pointsPerDay.total,
          rank: -1,
        };
      })
      .sort((a, b) => (b.totalPoints.gt(a.totalPoints) ? 1 : -1));

    for (let i = 0; i < sortedRows.length; i++) {
      if (i === 0) sortedRows[i].rank = 1;
      else {
        const row = sortedRows[i];
        const lastRow = sortedRows[i - 1];

        row.rank = roundPoints(row.totalPoints).eq(
          roundPoints(lastRow.totalPoints),
        )
          ? lastRow.rank
          : i + 1;
      }
    }

    setLeaderboardRows(sortedRows);
  }, [refreshedObligations, data]);

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
      refreshedObligationsUpdatedAt,
      leaderboardRows,
      rank,
    }),
    [refreshedObligationsUpdatedAt, leaderboardRows, rank],
  );

  return (
    <PointsContext.Provider value={contextValue}>
      {children}
    </PointsContext.Provider>
  );
}
