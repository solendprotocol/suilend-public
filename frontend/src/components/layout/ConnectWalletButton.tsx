import { useEffect, useState } from "react";

import { ConnectModal } from "@suiet/wallet-kit";

import ConnectedWalletDropdownMenu from "@/components/layout/ConnectedWalletDropdownMenu";
import ConnectWalletDropdownMenu from "@/components/layout/ConnectWalletDropdownMenu";
import { useWalletContext } from "@/contexts/WalletContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import { formatAddress } from "@/lib/format";

export default function ConnectWalletButton() {
  const { address } = useWalletContext();

  // Formatted address
  const [formattedAddress, setFormattedAddress] = useState<string | undefined>(
    undefined,
  );

  const { sm } = useBreakpoint();
  useEffect(() => {
    setFormattedAddress(
      address ? formatAddress(address, sm ? 6 : 4) : undefined,
    );
  }, [address, sm]);

  // Connect modal
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  return (
    <>
      <ConnectModal
        open={isConnectModalOpen}
        onConnectSuccess={() => setIsConnectModalOpen(false)}
        onOpenChange={setIsConnectModalOpen}
      />

      {address && formattedAddress ? (
        <ConnectedWalletDropdownMenu formattedAddress={formattedAddress} />
      ) : (
        <ConnectWalletDropdownMenu />
      )}
    </>
  );
}
