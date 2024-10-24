import BigNumber from "bignumber.js";
import { Pause, TriangleAlert } from "lucide-react";

import Card from "@/components/dashboard/Card";
import LoopedPosition from "@/components/layout/LoopedPosition";
import Button from "@/components/shared/Button";
import { TBodySans, TLabelSans } from "@/components/shared/Typography";
import { CardContent } from "@/components/ui/card";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { formatList } from "@/lib/format";
import {
  IS_LOOPING_MESSAGE,
  WAS_LOOPING_MESSAGE,
  getLoopedAssetCoinTypes,
} from "@/lib/looping";

export default function LoopingCard() {
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  const loopedAssetCoinTypes = getLoopedAssetCoinTypes(data, obligation);
  const isLooping = loopedAssetCoinTypes.length > 0;

  const zeroShareDeposits = (obligation?.deposits || []).filter(
    (d) =>
      d.depositedAmount.gt(0) &&
      new BigNumber(d.userRewardManager.share.toString()).eq(0),
  );
  const zeroShareBorrows = (obligation?.borrows || []).filter(
    (b) =>
      b.borrowedAmount.gt(0) &&
      new BigNumber(b.userRewardManager.share.toString()).eq(0),
  );
  const wasLooping =
    loopedAssetCoinTypes.length === 0 &&
    (zeroShareDeposits.length > 0 || zeroShareBorrows.length > 0);

  console.log(
    "XXX",
    isLooping,
    "-----",
    zeroShareDeposits,
    zeroShareBorrows,
    wasLooping,
  );

  const restoreEligibility = async () => {
    console.log("XXX", "restore");
  };

  if (isLooping)
    return (
      <Card
        className="border-warning/25 bg-warning/10"
        headerProps={{
          titleClassName: "text-warning",
          titleIcon: <TriangleAlert />,
          title: "Looping detected",
          noSeparator: true,
        }}
      >
        <CardContent className="flex flex-col gap-4">
          <TBodySans className="text-xs">{IS_LOOPING_MESSAGE}</TBodySans>

          <div className="flex flex-col gap-2">
            {loopedAssetCoinTypes.map((coinTypes) => (
              <LoopedPosition key={coinTypes.join(".")} coinTypes={coinTypes} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  if (wasLooping)
    return (
      <Card
        className="border-secondary/25 bg-secondary/10"
        headerProps={{
          titleClassName: "text-secondary",
          titleIcon: <Pause />,
          title: "LM Rewards paused",
          noSeparator: true,
        }}
      >
        <CardContent className="flex flex-col gap-4">
          <TBodySans className="text-xs">{WAS_LOOPING_MESSAGE}</TBodySans>

          <Button
            className="w-fit"
            variant="secondary"
            labelClassName="uppercase"
            onClick={restoreEligibility}
          >
            Restore eligibility
          </Button>

          <div className="flex w-full flex-col gap-2">
            {zeroShareDeposits.length > 0 && (
              <TLabelSans>
                Withdraws{" "}
                {formatList(
                  zeroShareDeposits.map(
                    (d) =>
                      `${new BigNumber(10)
                        .pow(-d.reserve.mintDecimals)
                        .toFixed(d.reserve.mintDecimals)} ${d.reserve.symbol}`,
                  ),
                )}
              </TLabelSans>
            )}
            {zeroShareBorrows.length > 0 && (
              <TLabelSans>
                Borrows{" "}
                {formatList(
                  zeroShareBorrows.map(
                    (b) =>
                      `${new BigNumber(10)
                        .pow(-b.reserve.mintDecimals)
                        .toFixed(b.reserve.mintDecimals)} ${b.reserve.symbol}`,
                  ),
                )}
              </TLabelSans>
            )}
          </div>
        </CardContent>
      </Card>
    );
}
