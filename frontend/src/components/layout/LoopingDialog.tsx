import { useState } from "react";

import { AlertTriangle } from "lucide-react";

import Dialog from "@/components/dashboard/Dialog";
import LoopedPosition from "@/components/layout/LoopedPosition";
import { TBodySans } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { LOOPING_MESSAGE, getLoopedAssetCoinTypes } from "@/lib/looping";

export default function LoopingDialog() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  const loopedAssetCoinTypes = getLoopedAssetCoinTypes(data);

  // State
  const [isOpen, setIsOpen] = useState<boolean>(
    loopedAssetCoinTypes.length > 0,
  );
  const onOpenChange = (_isOpen: boolean) => {
    setIsOpen(_isOpen);
  };

  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      dialogContentProps={{ className: "max-w-md border-warning/50" }}
      drawerContentProps={{ className: "border-warning/50" }}
      headerProps={{
        className: "pb-0",
        titleClassName: "text-warning",
        titleIcon: <AlertTriangle />,
        title: "Looping detected",
      }}
      isDialogAutoHeight
      isDrawerAutoHeight
    >
      <div className="flex flex-col gap-4 p-4">
        <TBodySans className="text-xs">{LOOPING_MESSAGE}</TBodySans>

        <div className="flex flex-col gap-2">
          {loopedAssetCoinTypes.map((coinTypes) => (
            <LoopedPosition key={coinTypes.join(".")} coinTypes={coinTypes} />
          ))}
        </div>
      </div>
    </Dialog>
  );
}
