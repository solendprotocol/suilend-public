import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import PointsCount from "@/components/points/PointsCount";
import PointsIcon from "@/components/points/PointsIcon";
import PointsRankCell from "@/components/points/PointsRank";
import Button from "@/components/shared/Button";
import Popover from "@/components/shared/Popover";
import { TLabel } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { usePointsContext } from "@/contexts/PointsContext";
import { formatPoints } from "@/lib/format";
import { POINTS_URL } from "@/lib/navigation";
import { getPointsRewards, getPointsStats } from "@/lib/points";

export default function PointsCountPopover() {
  const router = useRouter();
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const { rank } = usePointsContext();

  // Points
  const pointsRewards = getPointsRewards(data.rewardMap);
  const pointsStats = getPointsStats(pointsRewards, data.obligations);

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover
      id="header-points"
      rootProps={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className="gap-1.5 bg-[#142142] hover:bg-[#142142]/80"
          labelClassName="text-primary-foreground"
          startIcon={<PointsIcon className="h-4 w-4" />}
        >
          {formatPoints(pointsStats.totalPoints.total)}
        </Button>
      }
      contentProps={{
        align: "end",
        className: "w-[280px]",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-row items-center justify-between gap-4">
            <TLabel className="uppercase">Total points</TLabel>
            <PointsCount points={pointsStats.totalPoints.total} />
          </div>

          <div className="flex flex-row items-center justify-between gap-4">
            <TLabel className="uppercase">Points per day</TLabel>
            <PointsCount points={pointsStats.pointsPerDay.total} />
          </div>

          <div className="flex flex-row items-center justify-between gap-4">
            <TLabel className="uppercase">Rank</TLabel>
            <PointsRankCell rank={rank} isRightAligned />
          </div>
        </div>

        {router.asPath !== POINTS_URL && (
          <NextLink href={POINTS_URL} className="w-full">
            <Button
              className="w-full border-secondary text-primary-foreground"
              labelClassName="uppercase"
              variant="secondaryOutline"
              onClick={() => setIsOpen(false)}
            >
              Points hub
            </Button>
          </NextLink>
        )}
      </div>
    </Popover>
  );
}
