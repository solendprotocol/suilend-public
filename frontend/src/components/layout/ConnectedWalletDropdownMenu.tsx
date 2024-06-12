import Image from "next/image";
import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import Button from "@/components/shared/Button";
import CopyToClipboardButton from "@/components/shared/CopyToClipboardButton";
import DropdownMenu, {
  DropdownMenuItem,
} from "@/components/shared/DropdownMenu";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import Tooltip from "@/components/shared/Tooltip";
import { TLabel, TLabelSans } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Wallet } from "@/lib/wallets";

interface ConnectedWalletDropdownMenuProps {
  connectedWallet: Wallet;
  addressNameServiceNameMap: Record<string, string | undefined>;
}

export default function ConnectedWalletDropdownMenu({
  connectedWallet,
  addressNameServiceNameMap,
}: ConnectedWalletDropdownMenuProps) {
  const {
    accounts,
    account,
    selectAccount,
    isImpersonatingAddress,
    disconnectWallet,
    ...restWalletContext
  } = useWalletContext();
  const address = restWalletContext.address as string;
  const { explorer } = useAppContext();

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const Icon = isOpen ? ChevronUp : ChevronDown;

  return (
    <DropdownMenu
      root={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className="min-w-0"
          labelClassName="uppercase text-ellipsis overflow-hidden"
          startIcon={
            connectedWallet.logoUrl ? (
              <Image
                className="h-4 w-4"
                src={connectedWallet.logoUrl}
                alt={`${connectedWallet.name} logo`}
                width={16}
                height={16}
              />
            ) : undefined
          }
          endIcon={<Icon />}
          disabled={isImpersonatingAddress}
        >
          {account?.label ??
            addressNameServiceNameMap[address] ??
            formatAddress(address)}
        </Button>
      }
      title={account?.label ?? "Connected"}
      description={
        <div className="flex flex-row items-center gap-1">
          <Tooltip title={address}>
            <TLabel className="uppercase">
              {addressNameServiceNameMap[address] ?? formatAddress(address, 8)}
            </TLabel>
          </Tooltip>

          <div className="flex h-4 flex-row items-center">
            <CopyToClipboardButton
              value={addressNameServiceNameMap[address] ?? address}
            />
            <OpenOnExplorerButton url={explorer.buildAddressUrl(address)} />
          </div>
        </div>
      }
      items={
        <>
          <DropdownMenuItem onClick={disconnectWallet}>
            Disconnect
          </DropdownMenuItem>

          {!isImpersonatingAddress && accounts.length > 1 && (
            <>
              <TLabelSans className="mt-4">Switch to</TLabelSans>
              {accounts
                .filter((a) => a.address !== address)
                .map((a) => (
                  <DropdownMenuItem
                    key={a.address}
                    className="flex flex-col items-start gap-1"
                    onClick={() =>
                      selectAccount(
                        a.address,
                        addressNameServiceNameMap[a.address],
                      )
                    }
                  >
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                      {a.label && (
                        <TLabelSans className="overflow-hidden text-ellipsis text-nowrap text-foreground">
                          {a.label}
                        </TLabelSans>
                      )}

                      <TLabel
                        className={cn(
                          "uppercase",
                          !a.label && "text-foreground",
                          addressNameServiceNameMap[a.address]
                            ? "overflow-hidden text-ellipsis text-nowrap"
                            : "flex-shrink-0",
                        )}
                      >
                        {addressNameServiceNameMap[a.address] ??
                          formatAddress(a.address, a.label ? undefined : 8)}
                      </TLabel>
                    </div>
                  </DropdownMenuItem>
                ))}
            </>
          )}
        </>
      }
    />
  );
}
