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
import { useLocalStorage } from "usehooks-ts";

import FullPageSpinner from "@/components/shared/FullPageSpinner";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { ParsedCoinBalance, parseCoinBalances } from "@/lib/coinBalance";
import { COINTYPE_LOGO_MAP, COINTYPE_SYMBOL_MAP } from "@/lib/coinType";
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
const DEFAULT_TOKEN_OUT_SYMBOL = "USDC";

const getUrl = (inSymbol: string, outSymbol: string) =>
  `${SWAP_URL}/${inSymbol}-${outSymbol}`;

enum TokenDirection {
  IN = "in",
  OUT = "out",
}

interface SwapContext {
  hopSdk?: HopApi;
  aftermathSdk?: AftermathRouter;
  tokens?: VerifiedToken[];
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

  const isFetchingVerifiedTokensRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingVerifiedTokensRef.current) return;

      isFetchingVerifiedTokensRef.current = true;
      try {
        const result = await hopSdk.fetchTokens();
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
  }, [hopSdk]);

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
      hopSdk,
      aftermathSdk,
      tokens,
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
      tokenIn,
      tokenOut,
      setTokenSymbol,
      reverseTokenSymbols,
      coinBalancesMap,
    ],
  );

  return (
    <SwapContext.Provider value={contextValue}>
      {hopSdk && aftermathSdk && tokens && tokenIn && tokenOut ? (
        children
      ) : (
        <FullPageSpinner />
      )}
    </SwapContext.Provider>
  );
}
