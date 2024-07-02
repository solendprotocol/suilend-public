import { PartyPopper } from "lucide-react";

import { ApiDepositEvent } from "@suilend/sdk/types";

import Dialog from "@/components/dashboard/Dialog";
import { TLabelSans } from "@/components/shared/Typography";
import { useDashboardContext } from "@/contexts/DashboardContext";

export type EventsData = {
  deposit: ApiDepositEvent[];
};

export default function FirstDepositDialog() {
  const { isFirstDepositDialogOpen, setIsFirstDepositDialogOpen } =
    useDashboardContext();

  return (
    <Dialog
      rootProps={{
        open: isFirstDepositDialogOpen,
        onOpenChange: setIsFirstDepositDialogOpen,
      }}
      dialogContentProps={{ className: "max-w-md border-success/50" }}
      drawerContentProps={{ className: "border-success/50" }}
      headerProps={{
        className: "pb-0",
        titleClassName: "text-success",
        titleIcon: <PartyPopper />,
        title: "Congrats on your first deposit",
      }}
      isAutoHeight
    >
      <div className="flex flex-col gap-4 p-4">
        <TLabelSans className="text-foreground">
          {
            "Your account is represented as an NFT, which can be viewed from your wallet's NFT section. Remember, do not burn!"
          }
        </TLabelSans>

        <div className="h-[200px] w-full bg-muted/10" />
      </div>
    </Dialog>
  );
}
