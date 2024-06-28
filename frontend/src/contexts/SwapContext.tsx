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
  GetQuoteResponse,
  HopApi,
  HopApiOptions,
  SuiExchange,
  VerifiedToken,
} from "@hop.ag/sdk";
import { CoinMetadata } from "@mysten/sui.js/client";
import { normalizeStructTag } from "@mysten/sui.js/utils";
import { useLocalStorage } from "usehooks-ts";

import FullPageSpinner from "@/components/shared/FullPageSpinner";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { ParsedCoinBalance, parseCoinBalances } from "@/lib/coinBalance";
import { COINTYPE_LOGO_MAP, COINTYPE_SYMBOL_MAP } from "@/lib/coinType";
import { SWAP_URL } from "@/lib/navigation";

export const EXCHANGE_NAME_MAP: Record<SuiExchange, string> = {
  [SuiExchange.CETUS]: "Cetus",
  [SuiExchange.FLOWX]: "FlowX Finance",
  [SuiExchange.TURBOS]: "Turbos Finance",
  [SuiExchange.AFTERMATH]: "Aftermath Finance",
  [SuiExchange.KRIYA]: "Kriya",
  [SuiExchange.BLUEMOVE]: "BlueMove",
  [SuiExchange.DEEPBOOK]: "DeepBook",
  [SuiExchange.SUISWAP]: "Suiswap",
};

const DEFAULT_TOKEN_IN_SYMBOL = "SUI";
const DEFAULT_TOKEN_OUT_SYMBOL = "USDC";

const getUrl = (inSymbol: string, outSymbol: string) =>
  `${SWAP_URL}/${inSymbol}-${outSymbol}`;

enum TokenDirection {
  IN = "in",
  OUT = "out",
}

export type Quote = GetQuoteResponse & {
  id: string;
};

interface SwapContext {
  sdk?: HopApi;
  tokens?: VerifiedToken[];
  tokenIn?: VerifiedToken;
  tokenOut?: VerifiedToken;
  setTokenSymbol: (newTokenSymbol: string, direction: TokenDirection) => void;
  reverseTokenSymbols: () => void;
  coinBalancesMap?: Record<string, ParsedCoinBalance>;
}

const defaultContextValue: SwapContext = {
  sdk: undefined,
  tokens: undefined,
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

  const { rpc, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // SDK
  const sdk = useMemo(() => {
    const hop_api_options: HopApiOptions = {
      api_key: process.env.NEXT_PUBLIC_HOP_AG_API_KEY as string,
      fee_bps: 0,
      fee_wallet:
        "0x708d1c69654c3924176312dbd54d7ab2206d4935dce94e042129f8c3a2051edf",
    };

    return new HopApi(rpc.url, hop_api_options, true);
  }, [rpc.url]);

  // Tokens
  const [tokens, setTokens] = useState<VerifiedToken[] | undefined>(undefined);

  const isFetchingVerifiedTokensRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingVerifiedTokensRef.current) return;

      isFetchingVerifiedTokensRef.current = true;
      try {
        const result = await sdk.fetchTokens();
        setTokens(
          result.tokens.map((token) => {
            const coinType = normalizeStructTag(token.coin_type);

            return {
              ...token,
              coin_type: coinType,
              ticker: COINTYPE_SYMBOL_MAP[coinType] ?? token.ticker,
              icon_url: COINTYPE_LOGO_MAP[coinType] ?? token.icon_url,
            };
          }),
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, [sdk]);

  // Selected tokens
  const [tokenInSymbol, tokenOutSymbol] =
    slug !== undefined ? slug[0].split("-") : [undefined, undefined];

  const tokenIn = useMemo(
    () => tokens?.find((t) => t.ticker === tokenInSymbol),
    [tokens, tokenInSymbol],
  );
  const tokenOut = useMemo(
    () => tokens?.find((t) => t.ticker === tokenOutSymbol),
    [tokens, tokenOutSymbol],
  );

  const [lastTokenInSymbol, setLastTokenInSymbol] = useLocalStorage<string>(
    "swapLastTokenInSymbol",
    DEFAULT_TOKEN_IN_SYMBOL,
  );
  const [lastTokenOutSymbol, setLastTokenOutSymbol] = useLocalStorage<string>(
    "swapLastTokenOutSymbol",
    DEFAULT_TOKEN_OUT_SYMBOL,
  );

  useEffect(() => {
    if (
      slug === undefined ||
      slug[0].split("-").length !== 2 ||
      slug[0].split("-")[0] === slug[0].split("-")[1] ||
      (tokens && (!tokenIn || !tokenOut))
    )
      router.replace(
        { pathname: getUrl(lastTokenInSymbol, lastTokenOutSymbol) },
        undefined,
        { shallow: true },
      );
  }, [
    slug,
    tokens,
    tokenIn,
    tokenOut,
    router,
    lastTokenInSymbol,
    lastTokenOutSymbol,
  ]);

  const setTokenSymbol = useCallback(
    (newTokenSymbol: string, direction: TokenDirection) => {
      if (!tokenInSymbol || !tokenOutSymbol) return;

      router.push(
        {
          pathname: getUrl(
            direction === TokenDirection.IN ? newTokenSymbol : tokenInSymbol,
            direction === TokenDirection.IN ? tokenOutSymbol : newTokenSymbol,
          ),
        },
        undefined,
        { shallow: true },
      );

      if (direction === TokenDirection.IN) setLastTokenInSymbol(newTokenSymbol);
      else setLastTokenOutSymbol(newTokenSymbol);
    },
    [
      tokenInSymbol,
      tokenOutSymbol,
      router,
      setLastTokenInSymbol,
      setLastTokenOutSymbol,
    ],
  );

  const reverseTokenSymbols = useCallback(() => {
    if (!tokenInSymbol || !tokenOutSymbol) return;

    router.push(
      { pathname: getUrl(tokenOutSymbol, tokenInSymbol) },
      undefined,
      { shallow: true },
    );

    setLastTokenInSymbol(tokenOutSymbol as string);
    setLastTokenOutSymbol(tokenInSymbol as string);
  }, [
    tokenInSymbol,
    tokenOutSymbol,
    router,
    setLastTokenInSymbol,
    setLastTokenOutSymbol,
  ]);

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
      sdk,
      tokens,
      tokenIn,
      tokenOut,
      setTokenSymbol,
      reverseTokenSymbols,
      coinBalancesMap,
    }),
    [
      sdk,
      tokens,
      tokenIn,
      tokenOut,
      setTokenSymbol,
      reverseTokenSymbols,
      coinBalancesMap,
    ],
  );

  return (
    <SwapContext.Provider value={contextValue}>
      {tokens && tokenIn && tokenOut ? children : <FullPageSpinner />}
    </SwapContext.Provider>
  );
}
