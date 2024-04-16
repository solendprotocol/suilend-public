import Image from "next/image";
import React, { useState } from "react";

import * as Sentry from "@sentry/nextjs";
import { useWallet } from "@suiet/wallet-kit";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/shared/Button";
import Collapsible from "@/components/shared/Collapsible";
import DropdownMenu, {
  DropdownMenuItem,
} from "@/components/shared/DropdownMenu";
import TextLink from "@/components/shared/TextLink";
import { TBodySans, TLabel, TLabelSans } from "@/components/shared/Typography";
import { useWalletContext } from "@/contexts/WalletContext";
import useIsAndroid from "@/hooks/useIsAndroid";
import useIsiOS from "@/hooks/useIsiOS";
import { cn } from "@/lib/utils";

const PRIORITY_WALLET_IDS = ["Sui Wallet", "Nightly", "Suiet"];

type Wallet = {
  id: string;
  name: string;
  isInstalled: boolean;
  logoUrl?: string;
  downloadUrls: {
    browserExtension?: string;
    iOS?: string;
    android?: string;
  };
};

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
      toast.success(`Connected ${wallet.name}`);
    } catch (err) {
      if (!wallet.isInstalled) {
        toast.error(
          <TBodySans>
            {`${wallet.name} is not installed. `}
            {downloadUrl && <TextLink href={downloadUrl}>Install</TextLink>}
          </TBodySans>,
        );
      } else {
        toast.error(
          `Failed to connect to ${wallet.name}. Please try a different wallet.`,
        );
      }
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

          <TLabelSans className="text-inherit">{wallet.name}</TLabelSans>
        </div>

        <div className="flex flex-row items-center gap-2">
          {wallet.isInstalled && (
            <TLabel className="uppercase text-inherit">Installed</TLabel>
          )}
          <ChevronRight className="h-4 w-4" />
        </div>
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
  const walletDownloadUrls = {
    Suiet: {},
    "Sui Wallet": {
      android:
        "https://play.google.com/store/apps/details?id=com.mystenlabs.suiwallet",
    },
    Elli: {
      iOS: "https://apps.apple.com/tw/app/elli-sui-wallet/id6447304928",
      android:
        "https://play.google.com/store/apps/details?id=com.elliwallet.mobile",
    },
    "Ethos Wallet": {
      iOS: "https://apps.apple.com/us/app/ethos-sui-wallet/id6450018653",
      android:
        "https://play.google.com/store/apps/details?id=com.ethoswallet.ethosmobile",
    },
    "Frontier Wallet": {
      iOS: "https://apps.apple.com/us/app/frontier-crypto-defi-wallet/id1482380988",
      android:
        "https://play.google.com/store/apps/details?id=com.frontierwallet",
    },
    GlassWallet: {
      iOS: "https://apps.apple.com/app/glass-wallet/id6443949035",
      android: "https://play.google.com/store/apps/details?id=app.glasswallet",
    },
    "Martian Sui Wallet": {},
    "Morphis Wallet": {},
    Nightly: {
      iOS: "https://apps.apple.com/pl/app/nightly-multichain-wallet/id6444768157",
      android:
        "https://play.google.com/store/apps/details?id=com.nightlymobile",
    },
    "OneKey Wallet": {
      iOS: "https://apps.apple.com/us/app/onekey-blockchain-defi-wallet/id1609559473",
      android:
        "https://play.google.com/store/apps/details?id=so.onekey.app.wallet",
    },
    "Sensui Wallet": {
      android: "https://play.google.com/store/apps/details?id=com.gilwallet",
    },
    "Spacecy Sui Wallet": {},
    "Surf Wallet": {
      iOS: "https://apps.apple.com/us/app/surf-wallet/id6467386034",
      android:
        "https://play.google.com/store/apps/details?id=com.surf.suiwallet",
    },
    "TokenPocket Wallet": {
      iOS: "https://apps.apple.com/hk/app/tp-wallet-%E5%8A%A0%E5%AF%86-%E6%AF%94%E7%89%B9%E5%B9%A3%E9%8C%A2%E5%8C%85/id6444625622",
      android:
        "https://play.google.com/store/apps/details?id=vip.mytokenpocket",
    },
  };

  const { configuredWallets, detectedWallets } = useWallet();
  const wallets = [...configuredWallets, ...detectedWallets].map((w) => ({
    id: w.name,
    name: w.name,
    isInstalled: w.installed ?? false,
    logoUrl: w.name === "Spacecy Sui Wallet" ? undefined : w.iconUrl,
    downloadUrls: {
      browserExtension: w.downloadUrl.browserExtension,
      ...(walletDownloadUrls[w.name as keyof typeof walletDownloadUrls] ?? []),
    },
  })) as Wallet[];

  const installedWallets = wallets.filter((w) => w.isInstalled);
  const priorityWallets = PRIORITY_WALLET_IDS.map((wId) =>
    wallets.find((w) => w.id === wId),
  ).filter(Boolean) as Wallet[];

  // Categorize wallets
  const sortedInstalledWallets = installedWallets.sort((wA, wB) => {
    const wAPriorityIndex = priorityWallets.findIndex((w) => w.id === wA.id);
    const wBPriorityIndex = priorityWallets.findIndex((w) => w.id === wB.id);

    if (wAPriorityIndex > -1 && wBPriorityIndex > -1)
      return wAPriorityIndex - wBPriorityIndex;
    if (wAPriorityIndex === -1 && wBPriorityIndex === -1) return 0;
    if (wAPriorityIndex > -1) return -1;
    return 1;
  });
  const notInstalledPriorityWallets = priorityWallets.filter(
    (w) => !sortedInstalledWallets.find((iw) => iw.id === w.id),
  );

  const otherWallets = wallets.filter(
    (w) =>
      !sortedInstalledWallets.find((iw) => iw.id === w.id) &&
      !notInstalledPriorityWallets.find((iw) => iw.id === w.id),
  );

  // State
  const Icon = isConnectWalletDropdownOpen ? ChevronUp : ChevronDown;

  const [showOtherWallets, setShowOtherWallets] = useState<boolean>(false);

  return (
    <DropdownMenu
      root={{
        open: isConnectWalletDropdownOpen,
        onOpenChange: setIsConnectWalletDropdownOpen,
      }}
      trigger={
        <Button
          className="uppercase"
          endIcon={<Icon />}
          disabled={isImpersonatingAddress}
        >
          Connect<span className="hidden sm:inline"> wallet</span>
        </Button>
      }
      title="Select wallet"
      items={
        <>
          {[...sortedInstalledWallets, ...notInstalledPriorityWallets].map(
            (w) => (
              <WalletDropdownItem key={w.name} wallet={w} />
            ),
          )}

          <TLabelSans className="my-2">
            {
              "Don't have a wallet? Get started by trying one of the wallets above."
            }
          </TLabelSans>

          <Collapsible
            open={showOtherWallets}
            onOpenChange={setShowOtherWallets}
            title="Other wallets"
            buttonClassName={cn(
              "!bg-popover w-full justify-between px-0",
              showOtherWallets && "!text-primary-foreground",
            )}
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
