import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import Button from "@/components/shared/Button";
import CopyToClipboardButton from "@/components/shared/CopyToClipboardButton";
import DropdownMenu, {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/shared/DropdownMenu";
import Tooltip from "@/components/shared/Tooltip";
import { TLabel, TLabelSans } from "@/components/shared/Typography";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatAddress } from "@/lib/format";

interface ConnectedWalletDropdownMenuProps {
  formattedAddress: string;
}

export default function ConnectedWalletDropdownMenu({
  formattedAddress,
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

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const Icon = isOpen ? ChevronUp : ChevronDown;

  return (
    <DropdownMenu
      root={{ open: isOpen, onOpenChange: setIsOpen }}
      trigger={
        <Button
          labelClassName="uppercase"
          endIcon={<Icon />}
          disabled={isImpersonatingAddress}
        >
          {formattedAddress}
        </Button>
      }
      title={account?.label ?? "Connected"}
      description={
        <div className="flex h-4 flex-row items-center gap-1">
          <Tooltip title={address}>
            <TLabelSans>{formatAddress(address, 12)}</TLabelSans>
          </Tooltip>
          <CopyToClipboardButton value={address} />
        </div>
      }
      items={
        <>
          <DropdownMenuItem onClick={disconnectWallet}>
            Disconnect
          </DropdownMenuItem>

          {!isImpersonatingAddress && accounts.length > 1 && (
            <>
              <DropdownMenuSeparator />

              <TLabelSans className="mt-2">Other accounts</TLabelSans>
              {accounts
                .filter((a) => a.address !== address)
                .map((a) => (
                  <DropdownMenuItem
                    key={a.address}
                    className="flex flex-col items-start gap-1"
                    onClick={() => selectAccount(a.address)}
                  >
                    {a.label && (
                      <TLabel className="max-w-full overflow-hidden text-ellipsis text-nowrap uppercase text-inherit">
                        {a.label}
                      </TLabel>
                    )}
                    <TLabelSans className="text-inherit">
                      {formatAddress(a.address, 12)}
                    </TLabelSans>
                  </DropdownMenuItem>
                ))}
            </>
          )}
        </>
      }
    />
  );
}
