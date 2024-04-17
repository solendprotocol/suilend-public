import { useRouter } from "next/router";

import PointsHeader from "@/components/points/PointsHeader";
import PointsLeaderboardTable from "@/components/points/PointsLeaderboardTable";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import { useAppContext } from "@/contexts/AppContext";

function Page() {
  const router = useRouter();
  const tab = router.query.tab as string | undefined;

  // Tabs
  enum Tab {
    LEADERBOARD = "leaderboard",
    BREAKDOWN = "breakdown",
    HOW_IT_WORKS = "howItWorks",
  }

  const tabs = [
    { id: Tab.LEADERBOARD, title: "Leaderboard" },
    { id: Tab.BREAKDOWN, title: "Breakdown" },
    { id: Tab.HOW_IT_WORKS, title: "How it works" },
  ];

  const selectedTab =
    tab && Object.values(Tab).includes(tab as Tab)
      ? (tab as Tab)
      : Tab.LEADERBOARD;
  const onSelectedTabChange = (tab: Tab) => {
    router.push({ query: { tab } });
  };

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-6">
      <PointsHeader />

      {/* <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={(tab) => onSelectedTabChange(tab as Tab)}
        rootClassName="w-full max-w-[680px]"
      /> */}

      <PointsLeaderboardTable />
    </div>
  );
}

export default function Points() {
  const { suilendClient, data } = useAppContext();
  if (!suilendClient || !data) return <FullPageSpinner />;

  return <Page />;
}
