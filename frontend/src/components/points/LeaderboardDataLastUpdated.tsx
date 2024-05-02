import BigNumber from "bignumber.js";

import { usePointsContext } from "@/contexts/PointsContext";
import { formatDuration } from "@/lib/format";

export default function LeaderboardDataLastUpdated() {
  const { refreshedObligationsUpdatedAt } = usePointsContext();

  if (!refreshedObligationsUpdatedAt) return null;
  return (
    <>
      {"Last updated "}
      {formatDuration(
        new BigNumber(
          (new Date().getTime() - refreshedObligationsUpdatedAt.getTime()) /
            1000,
        ),
      )}
      {" ago"}
    </>
  );
}
