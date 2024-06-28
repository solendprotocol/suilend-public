import Image from "next/image";
import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import UtilizationBar from "@/components/dashboard/UtilizationBar";
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
import { formatAddress, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Wallet } from "@/lib/wallets";

interface ConnectedWalletDropdownMenuProps {
  connectedWallet?: Wallet;
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
  const { data, explorer, obligation, setObligationId } = useAppContext();

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const Icon = isOpen ? ChevronUp : ChevronDown;

  // Disconnect
  const hasDisconnect = !isImpersonatingAddress;

  // Subaccounts
  const hasSubaccounts =
    data && data.obligations && data.obligations.length > 1 && obligation;

  const [areSubaccountsCollapsed, setAreSubaccountsCollapsed] =
    useLocalStorage<boolean>("areSubaccountsCollapsed", false);
  const toggleAreSubaccountsCollapsed = () =>
    setAreSubaccountsCollapsed((are) => !are);

  const SubaccountsCollapseIcon = !areSubaccountsCollapsed
    ? ChevronUp
    : ChevronDown;

  // Wallets
  const hasWallets = !isImpersonatingAddress && accounts.length > 1;

  const [areWalletsCollapsed, setAreWalletsCollapsed] =
    useLocalStorage<boolean>("areWalletsCollapsed", false);
  const toggleAreWalletsCollapsed = () => setAreWalletsCollapsed((are) => !are);

  const WalletsCollapseIcon = !areWalletsCollapsed ? ChevronUp : ChevronDown;

  // Items
  const noItems = !hasDisconnect && !hasSubaccounts && !hasWallets;

  return (
    <DropdownMenu
      rootProps={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          className="min-w-0"
          labelClassName="uppercase text-ellipsis overflow-hidden"
          startIcon={
            !isImpersonatingAddress && connectedWallet?.logoUrl ? (
              <Image
                className="h-4 w-4 min-w-4 shrink-0"
                src={connectedWallet.logoUrl}
                alt={`${connectedWallet.name} logo`}
                width={16}
                height={16}
              />
            ) : undefined
          }
          endIcon={<Icon />}
        >
          {(!isImpersonatingAddress ? account?.label : undefined) ??
            addressNameServiceNameMap[address] ??
            formatAddress(address)}
        </Button>
      }
      title={
        (!isImpersonatingAddress ? account?.label : "Impersonating") ??
        "Connected"
      }
      description={
        <div className="flex flex-row items-center gap-1">
          <Tooltip title={address}>
            <TLabel className="uppercase">
              {addressNameServiceNameMap[address] ?? formatAddress(address)}
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
      noItems={noItems}
      items={
        <>
          {hasDisconnect && (
            <DropdownMenuItem onClick={disconnectWallet}>
              Disconnect
            </DropdownMenuItem>
          )}

          {/* Subaccounts */}
          {hasSubaccounts && (
            <>
              <Button
                className={cn(
                  "h-4 justify-start p-0 text-muted-foreground hover:bg-transparent",
                  hasDisconnect && "mt-2",
                )}
                labelClassName="font-sans text-xs"
                endIcon={<SubaccountsCollapseIcon />}
                variant="ghost"
                onClick={toggleAreSubaccountsCollapsed}
              >
                Subaccounts
              </Button>

              {!areSubaccountsCollapsed &&
                (data.obligations as ParsedObligation[]).map(
                  (o, index, array) => (
                    <DropdownMenuItem
                      key={o.id}
                      className="flex flex-col items-start gap-1"
                      isSelected={o.id === obligation.id}
                      onClick={() => setObligationId(o.id)}
                    >
                      <div className="flex w-full justify-between">
                        <TLabelSans className="text-foreground">
                          Subaccount{" "}
                          {array.findIndex((_o) => _o.id === o.id) + 1}
                        </TLabelSans>
                        <TLabelSans>
                          {o.positionCount} position
                          {o.positionCount > 1 ? "s" : ""}
                        </TLabelSans>
                      </div>

                      <div className="flex w-full justify-between">
                        <TLabelSans>
                          {formatUsd(o.depositedAmountUsd)} deposited
                        </TLabelSans>
                        <TLabelSans>
                          {formatUsd(o.borrowedAmountUsd)} borrowed
                        </TLabelSans>
                      </div>

                      <UtilizationBar
                        className="mt-2 h-1"
                        obligation={o}
                        noTooltip
                      />
                    </DropdownMenuItem>
                  ),
                )}
            </>
          )}

          {/* Wallets */}
          {hasWallets && (
            <>
              <Button
                className={cn(
                  "h-4 justify-start p-0 text-muted-foreground hover:bg-transparent",
                  (hasDisconnect || hasSubaccounts) && "mt-2",
                )}
                labelClassName="font-sans text-xs"
                endIcon={<WalletsCollapseIcon />}
                variant="ghost"
                onClick={toggleAreWalletsCollapsed}
              >
                Wallets
              </Button>

              {!areWalletsCollapsed &&
                accounts.map((a) => (
                  <DropdownMenuItem
                    key={a.address}
                    className="flex flex-col items-start gap-1"
                    isSelected={a.address === address}
                    onClick={() =>
                      selectAccount(
                        a.address,
                        addressNameServiceNameMap[a.address],
                      )
                    }
                  >
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                      <TLabel
                        className={cn(
                          "uppercase text-foreground",
                          addressNameServiceNameMap[a.address]
                            ? "overflow-hidden text-ellipsis text-nowrap"
                            : "shrink-0",
                        )}
                      >
                        {addressNameServiceNameMap[a.address] ??
                          formatAddress(a.address)}
                      </TLabel>

                      {a.label && (
                        <TLabelSans className="overflow-hidden text-ellipsis text-nowrap">
                          {a.label}
                        </TLabelSans>
                      )}
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
