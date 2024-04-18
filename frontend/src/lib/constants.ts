export const msPerYear = 31556952000; // Approx. 1000 * 60 * 60 * 24 * 365;

export const TOAST_DURATION = 3.5 * 1000;
export const TX_TOAST_DURATION = 10 * 1000;

export const SUI_DEPOSIT_GAS_MIN = 0.025;
export const SUI_REPAY_GAS_MIN = 0.01;

export const RPCS = [
  {
    id: "triton",
    name: "Triton",
    url: `https://solendf-suishar-0c55.mainnet.sui.rpcpool.com/${
      process.env.NEXT_PUBLIC_SUI_TRITON_DEV_API_KEY ?? ""
    }`,
  },
  {
    id: "fullNode",
    name: "Full Node",
    url: "https://fullnode.mainnet.sui.io:443",
  },
  {
    id: "allThatNode",
    name: "All That Node",
    url: "https://sui-mainnet-rpc.allthatnode.com",
  },
];

export const EXPLORERS = [
  {
    id: "suiVision",
    name: "SuiVision",
    buildAddressUrl: (address: string) =>
      `https://suivision.xyz/account/${address}`,
    buildObjectUrl: (id: string) => `https://suivision.xyz/object/${id}`,
    buildCoinUrl: (coinType: string) =>
      `https://suivision.xyz/coin/${coinType}`,
    buildTxUrl: (digest: string) => `https://suivision.xyz/txblock/${digest}`,
  },
  {
    id: "suiScan",
    name: "Suiscan",
    buildObjectUrl: (id: string) => `https://suiscan.xyz/mainnet/object/${id}`,
    buildCoinUrl: (coinType: string) =>
      `https://suiscan.xyz/mainnet/coin/${coinType}`,
    buildTxUrl: (digest: string) => `https://suiscan.xyz/mainnet/tx/${digest}`,
  },
];
