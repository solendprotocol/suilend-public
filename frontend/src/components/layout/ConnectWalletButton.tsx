import { useEffect, useMemo, useRef, useState } from "react";

import { SuiClient } from "@mysten/sui.js/client";
import { ConnectModal } from "@suiet/wallet-kit";

import ConnectedWalletDropdownMenu from "@/components/layout/ConnectedWalletDropdownMenu";
import ConnectWalletDropdownMenu from "@/components/layout/ConnectWalletDropdownMenu";
import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import { formatAddress } from "@/lib/format";

export default function ConnectWalletButton() {
  const { accounts, address } = useWalletContext();
  const appContext = useAppContext();
  const suiClient = appContext.suiClient as SuiClient;

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

  // Sui Name Service lookup
  const [accountNameServiceNames, setAccountNameServiceNames] = useState<
    Record<string, string | undefined>
  >({});

  const addressesBeingLookedUpRef = useRef<string[]>([]);
  const addressesToLookUp = useMemo(
    () =>
      Array.from(
        new Set(
          [address, ...accounts.map((_account) => _account.address)].filter(
            Boolean,
          ) as string[],
        ),
      ).filter(
        (_address) =>
          !Object.keys(accountNameServiceNames).includes(_address) &&
          !addressesBeingLookedUpRef.current.includes(_address),
      ),
    [address, accounts, accountNameServiceNames],
  );

  useEffect(() => {
    (async () => {
      if (addressesToLookUp.length === 0) return;

      try {
        addressesBeingLookedUpRef.current.push(...addressesToLookUp);

        const result = await Promise.all(
          addressesToLookUp.map((_address) =>
            suiClient.resolveNameServiceNames({ address: _address }),
          ),
        );

        setAccountNameServiceNames((o) =>
          result.reduce(
            (acc, addressResult, index) => ({
              ...acc,
              [addressesToLookUp[index]]: addressResult.data?.[0],
            }),
            o,
          ),
        );
      } catch (err) {
        setAccountNameServiceNames((o) =>
          addressesToLookUp.reduce(
            (acc, _address) => ({ ...acc, [_address]: undefined }),
            o,
          ),
        );
      }
    })();
  }, [addressesToLookUp, suiClient]);

  const isConnected =
    address &&
    formattedAddress &&
    Object.keys(accountNameServiceNames).includes(address);

  return (
    <>
      <ConnectModal
        open={isConnectModalOpen}
        onConnectSuccess={() => setIsConnectModalOpen(false)}
        onOpenChange={setIsConnectModalOpen}
      />

      {isConnected ? (
        <ConnectedWalletDropdownMenu
          formattedAddress={formattedAddress}
          accountNameServiceNames={accountNameServiceNames}
        />
      ) : (
        <ConnectWalletDropdownMenu />
      )}
    </>
  );
}
