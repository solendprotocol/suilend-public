import { useSearchParams } from "next/navigation";
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

import {
  DevInspectTransactionBlockParams,
  SuiClient,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  SuiSignTransactionBlockInput,
  WalletAccount,
} from "@mysten/wallet-standard";
import * as Sentry from "@sentry/nextjs";
import { useWallet } from "@suiet/wallet-kit";
import { useLDClient } from "launchdarkly-react-client-sdk";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

export interface WalletContextValue {
  isConnectWalletDropdownOpen: boolean;
  setIsConnectWalletDropdownOpen: Dispatch<SetStateAction<boolean>>;
  accounts: readonly WalletAccount[];
  account?: WalletAccount;
  selectAccount: (address: string) => void;
  address?: string;
  isImpersonatingAddress?: boolean;
  selectWallet: (name: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signExecuteAndWaitTransactionBlock: (
    suiClient: SuiClient,
    txb: TransactionBlock,
  ) => Promise<SuiTransactionBlockResponse>;
}

const WalletContext = createContext<WalletContextValue>({
  isConnectWalletDropdownOpen: false,
  setIsConnectWalletDropdownOpen: () => {
    throw new Error("WalletContextProvider not initialized");
  },
  accounts: [],
  account: undefined,
  selectAccount: async () => {
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
  signExecuteAndWaitTransactionBlock: async () => {
    throw new Error("WalletContextProvider not initialized");
  },
});

export const useWalletContext = () => useContext(WalletContext);

export function WalletContextProvider({ children }: PropsWithChildren) {
  const {
    chain,
    adapter,
    connected,
    select: selectWallet,
    disconnect: disconnectWallet,
    getAccounts,
  } = useWallet();

  const searchParams = useSearchParams();
  const impersonatedAddress = searchParams.get("wallet") ?? undefined;

  // Wallet connect dropdown
  const [isConnectWalletDropdownOpen, setIsConnectWalletDropdownOpen] =
    useState<boolean>(false);

  // Account
  const [accounts, setAccounts] = useState<readonly WalletAccount[]>([]);
  const [accountAddress, setAccountAddress] = useLocalStorage<
    string | undefined
  >("accountAddress", undefined);

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
    Sentry.setUser({ id: account?.address });
  }, [account?.address]);

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
  // Note: Do NOT import and use this function directly. Instead, use the signExecuteAndWaitTransactionBlock
  // from AppContext.
  const signExecuteAndWaitTransactionBlock = useCallback(
    async (suiClient: SuiClient, txb: TransactionBlock) => {
      const _address = impersonatedAddress ?? account?.address;
      if (_address) {
        (async () => {
          try {
            const simResult = await suiClient.devInspectTransactionBlock({
              sender: _address,
              transactionBlock:
                txb as unknown as DevInspectTransactionBlockParams["transactionBlock"],
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
        const signedTxb = await adapter.signTransactionBlock({
          transactionBlock: txb as unknown,
          account,
          chain: chain.id,
        } as SuiSignTransactionBlockInput);

        const res = await suiClient.executeTransactionBlock({
          transactionBlock: signedTxb.transactionBlockBytes,
          signature: signedTxb.signature,
          options: {
            showEffects: true,
          },
        });

        await suiClient.waitForTransactionBlock({
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
      selectAccount: (_address: string) => {
        const _account = accounts.find((a) => a.address === _address);
        if (!_account) return;

        setAccountAddress(_address);
        toast.info(
          `Switched to ${_account?.label ? _account.label : _address}`,
          { description: _account?.label ? _address : undefined },
        );
      },
      address: impersonatedAddress ?? account?.address,
      isImpersonatingAddress: !!impersonatedAddress,
      selectWallet,
      disconnectWallet: async () => {
        await disconnectWallet();
        toast.info("Disconnected wallet");
      },
      signExecuteAndWaitTransactionBlock,
    }),
    [
      isConnectWalletDropdownOpen,
      accounts,
      account,
      setAccountAddress,
      impersonatedAddress,
      selectWallet,
      disconnectWallet,
      signExecuteAndWaitTransactionBlock,
    ],
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}
