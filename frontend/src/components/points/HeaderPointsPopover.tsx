import NextLink from "next/link";
import { useState } from "react";

import BigNumber from "bignumber.js";

import PointsCount from "@/components/points/PointsCount";
import PointsIcon from "@/components/points/PointsIcon";
import PointsRankCell from "@/components/points/PointsRank";
import Button from "@/components/shared/Button";
import Popover from "@/components/shared/Popover";
import TitleChip from "@/components/shared/TitleChip";
import { TLabel } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { formatPoints } from "@/lib/format";
import { POINTS_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export default function PointsCountPopover() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover
      id="header-points"
      rootProps={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className={cn(
            "gap-1.5 bg-[#142142] hover:bg-[#142142]/80",
            isOpen && "bg-[#142142]/80",
          )}
          labelClassName="text-primary-foreground"
          startIcon={<PointsIcon className="h-4 w-4" />}
        >
          {formatPoints(new BigNumber(8771.5221))}
        </Button>
      }
      contentProps={{
        align: "end",
        className: "w-[280px]",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <TitleChip>Season 1 points</TitleChip>

        <PointsCount
          points={new BigNumber(2678.87)}
          className="gap-2"
          iconClassName="h-6 w-6"
          labelClassName="text-lg"
        />

        <Separator />

        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-row items-center justify-between gap-4">
            <TLabel className="uppercase">Points per day</TLabel>
            <PointsCount points={new BigNumber(543.4)} />
          </div>

          <div className="flex flex-row items-center justify-between gap-4">
            <TLabel className="uppercase">Rank</TLabel>
            <PointsRankCell rank={3} />
          </div>
        </div>

        <NextLink href={POINTS_URL} className="w-full">
          <Button
            className="w-full border-secondary text-primary-foreground"
            labelClassName="uppercase"
            variant="secondaryOutline"
          >
            View points hub
          </Button>
        </NextLink>
      </div>
    </Popover>
  );
}
