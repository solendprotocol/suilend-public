import PointsHeader from "@/components/points/PointsHeader";
import PointsLeaderboardTable from "@/components/points/PointsLeaderboardTable";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import { useAppContext } from "@/contexts/AppContext";

function Page() {
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-6">
      <PointsHeader />
      <PointsLeaderboardTable />
    </div>
  );
}

export default function Points() {
  const { suilendClient, data } = useAppContext();
  if (!suilendClient || !data) return <FullPageSpinner />;

  return <Page />;
}
