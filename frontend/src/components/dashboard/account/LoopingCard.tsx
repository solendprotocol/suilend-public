import { TriangleAlert } from "lucide-react";

import Card from "@/components/dashboard/Card";
import LoopedPosition from "@/components/layout/LoopedPosition";
import { TBodySans } from "@/components/shared/Typography";
import { CardContent } from "@/components/ui/card";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { LOOPING_MESSAGE, getLoopedAssetCoinTypes } from "@/lib/looping";

export default function LoopingCard() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  const loopedAssetCoinTypes = getLoopedAssetCoinTypes(data);

  if (loopedAssetCoinTypes.length === 0) return null;
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
        <TBodySans className="text-xs">{LOOPING_MESSAGE}</TBodySans>

        <div className="flex flex-col gap-2">
          {loopedAssetCoinTypes.map((coinTypes) => (
            <LoopedPosition key={coinTypes.join(".")} coinTypes={coinTypes} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
