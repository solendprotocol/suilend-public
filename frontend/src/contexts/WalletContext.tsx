import { useRouter } from "next/router";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import {
  IdentifierString,
  SuiSignAndExecuteTransactionOutput,
  WalletAccount,
} from "@mysten/wallet-standard";
import * as Sentry from "@sentry/nextjs";
import { useWallet } from "@suiet/wallet-kit";
import { useLDClient } from "launchdarkly-react-client-sdk";
import { toast } from "sonner";

import { formatAddress } from "@/lib/format";
import { API_URL } from "@/lib/navigation";
import { useListWallets } from "@/lib/wallets";

export enum QueryParams {
  WALLET = "wallet",
}

export interface WalletContext {
  isConnectWalletDropdownOpen: boolean;
  setIsConnectWalletDropdownOpen: Dispatch<SetStateAction<boolean>>;
  accounts: readonly WalletAccount[];
  account?: WalletAccount;
  selectAccount: (address: string, addressNameServiceName?: string) => void;
  address?: string;
  isImpersonatingAddress?: boolean;
  selectWallet: (name: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signExecuteAndWaitTransaction: (
    suiClient: SuiClient,
    tx: Transaction,
  ) => Promise<SuiSignAndExecuteTransactionOutput>;
}

const WalletContext = createContext<WalletContext>({
  isConnectWalletDropdownOpen: false,
  setIsConnectWalletDropdownOpen: () => {
    throw new Error("WalletContextProvider not initialized");
  },
  accounts: [],
  account: undefined,
  selectAccount: () => {
    throw new Error("WalletContextProvider not initialized");
  },
  address: undefined,
  isImpersonatingAddress: false,
  selectWallet: async () => {
    throw new Error("WalletContextProvider not initialized");
  },
  disconnectWallet: async () => {
    throw new Error("WalletContextProvider not initialized");
  },
  signExecuteAndWaitTransaction: async () => {
    throw new Error("WalletContextProvider not initialized");
  },
});

export const useWalletContext = () => useContext(WalletContext);

export function WalletContextProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const queryParams = {
    [QueryParams.WALLET]: router.query[QueryParams.WALLET] as
      | string
      | undefined,
  };

  const {
    chain,
    adapter,
    connected,
    select: selectWallet,
    disconnect: disconnectWallet,
    getAccounts,
  } = useWallet();

  // Impersonated address
  const impersonatedAddress = queryParams[QueryParams.WALLET];

  // Wallet connect dropdown
  const [isConnectWalletDropdownOpen, setIsConnectWalletDropdownOpen] =
    useState<boolean>(false);

  const { wallets } = useListWallets();
  const connectedWallet = wallets.find((w) => w.id === adapter?.name);

  // Account
  const [accounts, setAccounts] = useState<readonly WalletAccount[]>([]);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined,
  );
  useEffect(() => {
    setAccountAddress(
      window.localStorage.getItem("accountAddress") ?? undefined,
    );
  }, [connected]);

  useEffect(() => {
    if (connected) {
      const _accounts = getAccounts();
      setAccounts(_accounts);

      if (_accounts.length === 0) {
        // NO ACCOUNTS (should not happen) - set to undefined
        setAccountAddress(undefined);
        return;
      }

      if (accountAddress) {
        const account = _accounts.find((a) => a.address === accountAddress);
        if (account) {
          // ADDRESS SET + ACCOUNT FOUND - do nothing
          return;
        }

        // ADDRESS SET + NO ACCOUNT FOUND - set to first account's address
        setAccountAddress(_accounts[0].address);
      } else {
        // NO ADDRESS SET - set to first account's address
        setAccountAddress(_accounts[0].address);
      }
    } else {
      setAccounts([]);
    }
  }, [connected, getAccounts, accountAddress, setAccountAddress]);

  const account =
    accounts?.find((a) => a.address === accountAddress) ?? undefined;

  // Sentry
  useEffect(() => {
    if (impersonatedAddress) return;
    Sentry.setUser({ id: account?.address });
  }, [impersonatedAddress, account?.address]);

  // Wallet connect event
  const loggingWalletConnectEventRef = useRef<
    { address: string; walletName: string } | undefined
  >(undefined);
  useEffect(() => {
    if (impersonatedAddress) return;
    if (!account?.address || !connectedWallet) return;

    const walletName = connectedWallet.name;
    if (
      loggingWalletConnectEventRef.current?.address === account.address &&
      loggingWalletConnectEventRef.current?.walletName === walletName
    )
      return;

    const loggingWalletConnectEvent = { address: account?.address, walletName };
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
  }, [impersonatedAddress, account?.address, connectedWallet]);

  // LaunchDarkly
  const ldClient = useLDClient();
  const ldKeyRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!ldClient) return;

    const key = impersonatedAddress ?? account?.address;
    if (ldKeyRef.current === key) return;

    (async () => {
      await ldClient.identify(!key ? { anonymous: true } : { key });
      ldKeyRef.current = key;
    })();
  }, [ldClient, impersonatedAddress, account?.address]);

  // Tx
  // Note: Do NOT import and use this function directly. Instead, use the signExecuteAndWaitTransaction
  // from AppContext.
  const signExecuteAndWaitTransaction = useCallback(
    async (suiClient: SuiClient, tx: Transaction) => {
      const _address = impersonatedAddress ?? account?.address;
      if (_address) {
        (async () => {
          try {
            const simResult = await suiClient.devInspectTransactionBlock({
              sender: _address,
              transactionBlock: tx,
            });

            if (simResult.error) {
              throw simResult.error;
            }
          } catch (err) {
            Sentry.captureException(err, {
              extra: { simulation: true },
            });
            console.error(err);
            // throw err; - Do not rethrow error
          }
        })(); // Do not await
      }

      if (!chain) throw new Error("Missing chain");
      if (!adapter) throw new Error("Missing adapter");
      if (!account) throw new Error("Missing account");

      try {
        const res = await adapter.signAndExecuteTransaction({
          transaction: tx,
          account,
          chain: chain.id as IdentifierString,
        });

        await suiClient.waitForTransaction({
          digest: res.digest,
        });

        return res;
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }
    },
    [impersonatedAddress, account, chain, adapter],
  );

  // Context
  const contextValue = useMemo(
    () => ({
      isConnectWalletDropdownOpen,
      setIsConnectWalletDropdownOpen,
      accounts,
      account,
      selectAccount: (_address: string, addressNameServiceName?: string) => {
        const _account = accounts.find((a) => a.address === _address);
        if (!_account) return;

        setAccountAddress(_address);
        window.localStorage.setItem("accountAddress", _address);

        toast.info(
          `Switched to ${_account?.label ?? addressNameServiceName ?? formatAddress(_address)}`,
          {
            description: _account?.label
              ? addressNameServiceName ?? formatAddress(_address)
              : undefined,
            descriptionClassName: "uppercase !font-mono",
          },
        );
      },
      address: impersonatedAddress ?? account?.address,
      isImpersonatingAddress: !!impersonatedAddress,
      selectWallet,
      disconnectWallet: async () => {
        await disconnectWallet();
        toast.info("Disconnected wallet");
      },
      signExecuteAndWaitTransaction,
    }),
    [
      isConnectWalletDropdownOpen,
      accounts,
      account,
      setAccountAddress,
      impersonatedAddress,
      selectWallet,
      disconnectWallet,
      signExecuteAndWaitTransaction,
    ],
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}
