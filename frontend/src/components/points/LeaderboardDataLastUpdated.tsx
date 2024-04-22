import BigNumber from "bignumber.js";

import { usePointsContext } from "@/contexts/PointsContext";
import { formatDuration } from "@/lib/format";

export default function LeaderboardDataLastUpdated() {
  const { rawObligationsUpdatedAt } = usePointsContext();

  if (!rawObligationsUpdatedAt) return null;
  return (
    <>
      {"Last updated "}
      {formatDuration(
        new BigNumber(
          (new Date().getTime() - rawObligationsUpdatedAt.getTime()) / 1000,
        ),
      )}
      {" ago"}
    </>
  );
}
