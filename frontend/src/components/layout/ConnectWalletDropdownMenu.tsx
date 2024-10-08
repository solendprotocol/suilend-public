import Image from "next/image";
import React, { useState } from "react";

import * as Sentry from "@sentry/nextjs";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/shared/Button";
import Collapsible from "@/components/shared/Collapsible";
import DropdownMenu, {
  DropdownMenuItem,
} from "@/components/shared/DropdownMenu";
import { TLabelSans } from "@/components/shared/Typography";
import { useWalletContext } from "@/contexts/WalletContext";
import useIsAndroid from "@/hooks/useIsAndroid";
import useIsiOS from "@/hooks/useIsiOS";
import { cn } from "@/lib/utils";
import { Wallet, useListWallets } from "@/lib/wallets";

interface WalletDropdownItemProps {
  wallet: Wallet;
}

function WalletDropdownItem({ wallet }: WalletDropdownItemProps) {
  const { selectWallet } = useWalletContext();

  const isiOS = useIsiOS();
  const isAndroid = useIsAndroid();

  const platform: keyof Wallet["downloadUrls"] = isiOS
    ? "iOS"
    : isAndroid
      ? "android"
      : "browserExtension";
  const downloadUrl = wallet.downloadUrls[platform];

  const onClick = async () => {
    if (!wallet.isInstalled) {
      window.open(downloadUrl, "_blank");
      return;
    }

    try {
      await selectWallet(wallet.name);
      toast.info(`Connected ${wallet.name}`);
    } catch (err) {
      toast.error(`Failed to connect ${wallet.name}`, {
        description: "Please try a different wallet.",
      });
      Sentry.captureException(err);
      console.error(err);
    }
  };

  if (!wallet.isInstalled && !downloadUrl) return null;
  return (
    <DropdownMenuItem onClick={onClick}>
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-2">
          {wallet.logoUrl ? (
            <Image
              src={wallet.logoUrl}
              alt={`${wallet.name} logo`}
              width={24}
              height={24}
            />
          ) : (
            <div className="h-6 w-6" />
          )}

          <TLabelSans className="text-foreground">{wallet.name}</TLabelSans>
        </div>

        {wallet.isInstalled && <TLabelSans>Installed</TLabelSans>}
      </div>
    </DropdownMenuItem>
  );
}

export default function ConnectWalletDropdownMenu() {
  const {
    isConnectWalletDropdownOpen,
    setIsConnectWalletDropdownOpen,
    isImpersonatingAddress,
  } = useWalletContext();

  // Wallets
  const { mainWallets, otherWallets } = useListWallets();

  // State
  const Icon = isConnectWalletDropdownOpen ? ChevronUp : ChevronDown;

  const [showOtherWallets, setShowOtherWallets] = useState<boolean>(false);

  return (
    <DropdownMenu
      rootProps={{
        open: isConnectWalletDropdownOpen,
        onOpenChange: setIsConnectWalletDropdownOpen,
      }}
      trigger={
        <Button
          labelClassName="uppercase"
          endIcon={<Icon />}
          disabled={isImpersonatingAddress}
        >
          Connect<span className="hidden sm:inline"> wallet</span>
        </Button>
      }
      title="Select wallet"
      items={
        <>
          {mainWallets.map((w) => (
            <WalletDropdownItem key={w.name} wallet={w} />
          ))}

          <TLabelSans className="my-2">
            {
              "Don't have a Sui wallet? Get started by trying one of the wallets above."
            }
          </TLabelSans>

          <Collapsible
            open={showOtherWallets}
            onOpenChange={setShowOtherWallets}
            title="Other wallets"
            buttonClassName="w-full justify-between px-0"
          >
            <div
              className={cn("flex flex-col gap-2", showOtherWallets && "mt-4")}
            >
              {otherWallets.map((w) => (
                <WalletDropdownItem key={w.name} wallet={w} />
              ))}
            </div>
          </Collapsible>
        </>
      }
    />
  );
}
