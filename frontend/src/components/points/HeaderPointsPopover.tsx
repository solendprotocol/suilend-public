import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import { ExternalLink } from "lucide-react";

import PointsCount from "@/components/points/PointsCount";
import PointsIcon from "@/components/points/PointsIcon";
import PointsRank from "@/components/points/PointsRank";
import Button from "@/components/shared/Button";
import Popover from "@/components/shared/Popover";
import { TLabel, TTitle } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/contexts/AppContext";
import { usePointsContext } from "@/contexts/PointsContext";
import { formatPoints } from "@/lib/format";
import { POINTS_URL } from "@/lib/navigation";
import { getPointsStats } from "@/lib/points";

export default function PointsCountPopover() {
  const router = useRouter();
  const { data } = useAppContext();
  const { rank } = usePointsContext();

  // Points
  const pointsStats = data
    ? getPointsStats(data.rewardMap, data.obligations)
    : undefined;

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover
      id="header-points"
      rootProps={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className="gap-1.5 bg-[#142142] hover:bg-[#142142]/80"
          startIcon={<PointsIcon className="h-4 w-4" />}
        >
          {pointsStats ? (
            formatPoints(pointsStats.totalPoints.total)
          ) : (
            <Skeleton className="h-5 w-10" />
          )}
        </Button>
      }
      contentProps={{
        align: "end",
        className: "w-[280px]",
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex w-full flex-col gap-2">
          <TTitle className="uppercase">Points hub</TTitle>
          <Separator />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-row items-center justify-between gap-4">
            <TLabel className="uppercase">Total points</TLabel>
            <PointsCount points={pointsStats?.totalPoints.total} />
          </div>

          <div className="flex flex-row items-center justify-between gap-4">
            <TLabel className="uppercase">Points per day</TLabel>
            <PointsCount points={pointsStats?.pointsPerDay.total} />
          </div>

          <div className="flex flex-row items-center justify-between gap-4">
            <TLabel className="uppercase">Rank</TLabel>
            <PointsRank rank={rank} isRightAligned />
          </div>
        </div>

        {!router.asPath.startsWith(POINTS_URL) && (
          <NextLink href={POINTS_URL} className="w-full">
            <Button
              className="w-full border-secondary text-primary-foreground"
              labelClassName="uppercase"
              variant="secondaryOutline"
              endIcon={<ExternalLink />}
              onClick={() => setIsOpen(false)}
            >
              Leaderboard
            </Button>
          </NextLink>
        )}
      </div>
    </Popover>
  );
}
