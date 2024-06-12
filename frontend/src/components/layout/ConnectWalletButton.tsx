import { useEffect, useMemo, useRef, useState } from "react";

import { SuiClient } from "@mysten/sui.js/client";
import { ConnectModal, useWallet } from "@suiet/wallet-kit";

import ConnectedWalletDropdownMenu from "@/components/layout/ConnectedWalletDropdownMenu";
import ConnectWalletDropdownMenu from "@/components/layout/ConnectWalletDropdownMenu";
import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { API_URL } from "@/lib/navigation";
import { useListWallets } from "@/lib/wallets";

export default function ConnectWalletButton() {
  const { adapter } = useWallet();
  const { accounts, address } = useWalletContext();
  const appContext = useAppContext();
  const suiClient = appContext.suiClient as SuiClient;

  // Connect modal
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);

  // Conencted wallet details
  const { wallets } = useListWallets();
  const connectedWallet = wallets.find((w) => w.id === adapter?.name);

  // Sui Name Service lookup
  const [addressNameServiceNameMap, setAddressNameServiceNameMap] = useState<
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
          !Object.keys(addressNameServiceNameMap).includes(_address) &&
          !addressesBeingLookedUpRef.current.includes(_address),
      ),
    [address, accounts, addressNameServiceNameMap],
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

        setAddressNameServiceNameMap((o) =>
          result.reduce(
            (acc, addressResult, index) => ({
              ...acc,
              [addressesToLookUp[index]]: addressResult.data?.[0],
            }),
            o,
          ),
        );
      } catch (err) {
        setAddressNameServiceNameMap((o) =>
          addressesToLookUp.reduce(
            (acc, _address) => ({ ...acc, [_address]: undefined }),
            o,
          ),
        );
      }
    })();
  }, [addressesToLookUp, suiClient]);

  // Wallet connect event
  const loggingWalletConnectEventRef = useRef<
    { address: string; walletName: string } | undefined
  >(undefined);
  useEffect(() => {
    if (!(address && connectedWallet)) return;

    const walletName = connectedWallet.name;
    if (
      loggingWalletConnectEventRef.current?.address === address &&
      loggingWalletConnectEventRef.current?.walletName === walletName
    )
      return;

    const loggingWalletConnectEvent = { address, walletName };
    loggingWalletConnectEventRef.current = loggingWalletConnectEvent;

    (async () => {
      try {
        const url = `${API_URL}/events/logs/wallet-connect`;
        await fetch(url, {
          method: "POST",
          body: JSON.stringify(loggingWalletConnectEvent),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [address, connectedWallet]);

  const isConnected =
    address &&
    connectedWallet &&
    Object.keys(addressNameServiceNameMap).includes(address);

  return (
    <>
      <ConnectModal
        open={isConnectModalOpen}
        onConnectSuccess={() => setIsConnectModalOpen(false)}
        onOpenChange={setIsConnectModalOpen}
      />

      {isConnected ? (
        <ConnectedWalletDropdownMenu
          connectedWallet={connectedWallet}
          addressNameServiceNameMap={addressNameServiceNameMap}
        />
      ) : (
        <ConnectWalletDropdownMenu />
      )}
    </>
  );
}
