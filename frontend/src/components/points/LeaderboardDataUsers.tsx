import { Skeleton } from "@/components/ui/skeleton";
import { usePointsContext } from "@/contexts/PointsContext";
import { formatInteger } from "@/lib/format";

export default function LeaderboardDataUsers() {
  const { leaderboardRows } = usePointsContext();

  return (
    <>
      {leaderboardRows ? (
        formatInteger(leaderboardRows.length)
      ) : (
        <Skeleton className="inline-block h-4 w-10 align-top" />
      )}
      {" users"}
    </>
  );
}
