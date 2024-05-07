import { usePointsContext } from "@/contexts/PointsContext";
import { formatInteger } from "@/lib/format";

export default function LeaderboardDataUsers() {
  const { leaderboardRows } = usePointsContext();

  if (!leaderboardRows) return null;
  return (
    <>
      {formatInteger(leaderboardRows.length)}
      {" users"}
    </>
  );
}
