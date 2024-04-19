import BigNumber from "bignumber.js";

import { Skeleton } from "@/components/ui/skeleton";
import { usePointsContext } from "@/contexts/PointsContext";
import { formatDuration } from "@/lib/format";

export default function LeaderboardDataLastUpdated() {
  const { rawObligationsUpdatedAt } = usePointsContext();

  return (
    <>
      {"Last updated "}
      {rawObligationsUpdatedAt ? (
        formatDuration(
          new BigNumber(
            (new Date().getTime() - rawObligationsUpdatedAt.getTime()) / 1000,
          ),
        )
      ) : (
        <Skeleton className="inline-block h-4 w-10 align-top" />
      )}
      {" ago"}
    </>
  );
}
