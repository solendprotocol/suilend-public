import { useRouter } from "next/router";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  HopApi,
  HopApiOptions,
  GetQuoteResponse as HopGetQuoteResponse,
  SuiExchange as HopSuiExchange,
  VerifiedToken,
} from "@hop.ag/sdk";
import { CoinMetadata } from "@mysten/sui/client";
import { normalizeStructTag } from "@mysten/sui/utils";
import {
  Aftermath,
  Router as AftermathRouter,
  RouterCompleteTradeRoute as AftermathRouterCompleteTradeRoute,
  RouterProtocolName as AftermathRouterProtocolName,
} from "aftermath-ts-sdk";
import BigNumber from "bignumber.js";

import FullPageSpinner from "@/components/shared/FullPageSpinner";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { ParsedCoinBalance, parseCoinBalances } from "@/lib/coinBalance";
import { getCoinMetadataMap } from "@/lib/coinMetadata";
import {
  COINTYPE_LOGO_MAP,
  COINTYPE_SYMBOL_MAP,
  isCoinType,
} from "@/lib/coinType";
import { SWAP_URL } from "@/lib/navigation";

export enum UnifiedQuoteType {
  HOP = "hop",
  AFTERMATH = "aftermath",
}

export type UnifiedQuote = {
  id: string;
  amount_in: BigNumber;
  amount_out: BigNumber;
  coin_type_in: string;
  coin_type_out: string;
} & (
  | { type: UnifiedQuoteType.HOP; quote: HopGetQuoteResponse }
  | {
      type: UnifiedQuoteType.AFTERMATH;
      quote: AftermathRouterCompleteTradeRoute;
    }
);

export const HOP_EXCHANGE_NAME_MAP: Record<HopSuiExchange, string> = {
  [HopSuiExchange.CETUS]: "Cetus",
  [HopSuiExchange.FLOWX]: "FlowX Finance",
  [HopSuiExchange.TURBOS]: "Turbos Finance",
  [HopSuiExchange.AFTERMATH]: "Aftermath Finance",
  [HopSuiExchange.KRIYA]: "Kriya",
  [HopSuiExchange.BLUEMOVE]: "BlueMove",
  [HopSuiExchange.DEEPBOOK]: "DeepBook",
  [HopSuiExchange.SUISWAP]: "Suiswap",
};
export const AF_EXCHANGE_NAME_MAP: Record<AftermathRouterProtocolName, string> =
  {
    Cetus: "Cetus",
    FlowX: "FlowX Finance",
    Turbos: "Turbos Finance",
    Aftermath: "Aftermath Finance",
    Kriya: "Kriya",
    BlueMove: "BlueMove",
    DeepBook: "DeepBook",
    Suiswap: "Suiswap",
    afSUI: "afSUI",
    BaySwap: "BaySwap",
    FlowXClmm: "FlowX Finance",
    Interest: "Interest",
  };

const DEFAULT_TOKEN_IN_SYMBOL = "SUI";
const DEFAULT_TOKEN_OUT_SYMBOL = "wUSDC";

export const getSwapUrl = (
  inSymbol: string = DEFAULT_TOKEN_IN_SYMBOL,
  outSymbol: string = DEFAULT_TOKEN_OUT_SYMBOL,
) => `${SWAP_URL}/${inSymbol}-${outSymbol}`;

export enum TokenDirection {
  IN = "in",
  OUT = "out",
}

interface SwapContext {
  hopSdk?: HopApi;
  aftermathSdk?: AftermathRouter;
  tokens?: VerifiedToken[];
  verifiedTokens?: VerifiedToken[];
  fetchTokensMetadata: (coinTypes: string[]) => Promise<void>;
  tokenIn?: VerifiedToken;
  tokenOut?: VerifiedToken;
  setTokenSymbol: (newTokenSymbol: string, direction: TokenDirection) => void;
  reverseTokenSymbols: () => void;
  coinBalancesMap?: Record<string, ParsedCoinBalance>;
}

const defaultContextValue: SwapContext = {
  hopSdk: undefined,
  aftermathSdk: undefined,
  tokens: undefined,
  verifiedTokens: undefined,
  fetchTokensMetadata: async () => {
    throw Error("SwapContextProvider not initialized");
  },
  tokenIn: undefined,
  tokenOut: undefined,
  setTokenSymbol: () => {
    throw Error("SwapContextProvider not initialized");
  },
  reverseTokenSymbols: () => {
    throw Error("SwapContextProvider not initialized");
  },
  coinBalancesMap: undefined,
};

const SwapContext = createContext<SwapContext>(defaultContextValue);

export const useSwapContext = () => useContext(SwapContext);

export function SwapContextProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const slug = router.query.slug as string[] | undefined;

  const { suiClient, rpc, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // Hop SDK
  const hopSdk = useMemo(() => {
    const hop_api_options: HopApiOptions = {
      api_key: process.env.NEXT_PUBLIC_HOP_AG_API_KEY as string,
      fee_bps: 0,
      fee_wallet:
        "0x708d1c69654c3924176312dbd54d7ab2206d4935dce94e042129f8c3a2051edf",
    };

    return new HopApi(rpc.url, hop_api_options, true);
  }, [rpc.url]);

  // Aftermath SDK
  const aftermathSdk = useMemo(() => {
    const afSdk = new Aftermath("MAINNET");
    afSdk.init();
    return afSdk.Router();
  }, []);

  // Tokens
  const [tokens, setTokens] = useState<VerifiedToken[] | undefined>(undefined);
  const [verifiedTokens, setVerifiedTokens] = useState<
    VerifiedToken[] | undefined
  >(undefined);

  const isFetchingVerifiedTokensRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingVerifiedTokensRef.current) return;

      isFetchingVerifiedTokensRef.current = true;
      try {
        const result = (await hopSdk.fetchTokens()).tokens.map((token) => {
          const coinType = normalizeStructTag(token.coin_type);

          return {
            ...token,
            coin_type: coinType,
            ticker: COINTYPE_SYMBOL_MAP[coinType] ?? token.ticker,
            icon_url: COINTYPE_LOGO_MAP[coinType] ?? token.icon_url,
          };
        }) as VerifiedToken[];

        setTokens((prev) => [
          ...(prev ?? []),
          ...result.filter(
            (token) =>
              !(prev ?? []).find((t) => t.coin_type === token.coin_type),
          ),
        ]);
        setVerifiedTokens(result);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [hopSdk]);

  const fetchingTokensMetadataRef = useRef<string[]>([]);
  const fetchTokensMetadata = useCallback(
    async (coinTypes: string[]) => {
      const filteredCoinTypes = coinTypes.filter(
        (coinType) => !fetchingTokensMetadataRef.current.includes(coinType),
      );
      if (filteredCoinTypes.length === 0) return;

      fetchingTokensMetadataRef.current.push(...filteredCoinTypes);

      const coinsMetadataMap = await getCoinMetadataMap(
        suiClient,
        filteredCoinTypes,
      );

      setTokens((prev) => [
        ...(prev ?? []),
        ...Object.entries(coinsMetadataMap)
          .map(([coinType, metadata]) => ({
            coin_type: normalizeStructTag(coinType),
            name: metadata.name,
            ticker: metadata.symbol,
            icon_url: metadata.iconUrl ?? "",
            decimals: metadata.decimals,
          }))
          .filter(
            (token) =>
              !(prev ?? []).find((t) => t.coin_type === token.coin_type),
          ),
      ]);
    },
    [suiClient],
  );

  useEffect(() => {
    fetchTokensMetadata([
      ...data.lendingMarket.reserves.map((reserve) => reserve.coinType),
      ...data.coinBalancesRaw
        .filter((cb) => +cb.totalBalance > 0)
        .map((cb) => cb.coinType),
    ]);
  }, [fetchTokensMetadata, data.lendingMarket.reserves, data.coinBalancesRaw]);

  // Selected tokens
  const [tokenInSymbol, tokenOutSymbol] =
    slug !== undefined ? slug[0].split("-") : [undefined, undefined];

  useEffect(() => {
    const selectedCoinTypes = [
      tokenInSymbol !== undefined && isCoinType(tokenInSymbol)
        ? normalizeStructTag(tokenInSymbol)
        : undefined,
      tokenOutSymbol !== undefined && isCoinType(tokenOutSymbol)
        ? normalizeStructTag(tokenOutSymbol)
        : undefined,
    ].filter(Boolean) as string[];

    fetchTokensMetadata(selectedCoinTypes);
  }, [suiClient, tokenInSymbol, tokenOutSymbol, fetchTokensMetadata]);

  const tokenIn = useMemo(
    () =>
      tokens?.find(
        (t) => t.ticker === tokenInSymbol || t.coin_type === tokenInSymbol,
      ),
    [tokens, tokenInSymbol],
  );
  const tokenOut = useMemo(
    () =>
      tokens?.find(
        (t) => t.ticker === tokenOutSymbol || t.coin_type === tokenOutSymbol,
      ),
    [tokens, tokenOutSymbol],
  );

  useEffect(() => {
    if (
      slug === undefined ||
      slug[0].split("-").length !== 2 ||
      slug[0].split("-")[0] === slug[0].split("-")[1]
    )
      router.replace({ pathname: getSwapUrl() }, undefined, { shallow: true });
    else {
      if (!tokens) return;

      const [t1, t2] = slug[0].split("-");
      if (
        (!isCoinType(t1) && !tokens.find((t) => t.ticker === t1)) ||
        (!isCoinType(t2) && !tokens.find((t) => t.ticker === t2))
      ) {
        router.replace({ pathname: getSwapUrl() }, undefined, {
          shallow: true,
        });
      }
    }
  }, [slug, router, tokens]);

  const setTokenSymbol = useCallback(
    (newTokenSymbol: string, direction: TokenDirection) => {
      if (!tokenInSymbol || !tokenOutSymbol) return;

      router.push(
        {
          pathname: getSwapUrl(
            direction === TokenDirection.IN ? newTokenSymbol : tokenInSymbol,
            direction === TokenDirection.IN ? tokenOutSymbol : newTokenSymbol,
          ),
        },
        undefined,
        { shallow: true },
      );
    },
    [tokenInSymbol, tokenOutSymbol, router],
  );

  const reverseTokenSymbols = useCallback(() => {
    if (!tokenInSymbol || !tokenOutSymbol) return;

    router.push(
      { pathname: getSwapUrl(tokenOutSymbol, tokenInSymbol) },
      undefined,
      { shallow: true },
    );
  }, [tokenInSymbol, tokenOutSymbol, router]);

  // Balances
  const coinBalancesMap = useMemo(() => {
    if (!tokens) return undefined;
    const coinMetadataMap = tokens.reduce(
      (acc, t) => ({
        ...acc,
        [t.coin_type]: {
          decimals: t.decimals,
          description: "",
          iconUrl: t.icon_url,
          id: "",
          name: t.name,
          symbol: t.ticker,
        } as CoinMetadata,
      }),
      {},
    ) as Record<string, CoinMetadata>;

    return parseCoinBalances(
      data.coinBalancesRaw,
      Object.keys(coinMetadataMap),
      undefined,
      coinMetadataMap,
    );
  }, [tokens, data.coinBalancesRaw]);

  // Context
  const contextValue: SwapContext = useMemo(
    () => ({
      hopSdk,
      aftermathSdk,
      tokens,
      verifiedTokens,
      fetchTokensMetadata,
      tokenIn,
      tokenOut,
      setTokenSymbol,
      reverseTokenSymbols,
      coinBalancesMap,
    }),
    [
      hopSdk,
      aftermathSdk,
      tokens,
      verifiedTokens,
      fetchTokensMetadata,
      tokenIn,
      tokenOut,
      setTokenSymbol,
      reverseTokenSymbols,
      coinBalancesMap,
    ],
  );

  return (
    <SwapContext.Provider value={contextValue}>
      {hopSdk &&
      aftermathSdk &&
      tokens &&
      verifiedTokens &&
      tokenIn &&
      tokenOut ? (
        children
      ) : (
        <FullPageSpinner />
      )}
    </SwapContext.Provider>
  );
}
