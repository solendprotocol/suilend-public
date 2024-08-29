import BigNumber from "bignumber.js";

import { usePointsContext } from "@/contexts/PointsContext";
import { formatDuration } from "@/lib/format";

export default function LeaderboardDataLastUpdated() {
  const { updatedAt } = usePointsContext();

  if (!updatedAt) return null;
  return (
    <>
      {"Last updated "}
      {formatDuration(
        new BigNumber((new Date().getTime() - updatedAt.getTime()) / 1000),
      )}
      {" ago"}
    </>
  );
}
