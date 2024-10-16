import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  HopApi,
  GetQuoteResponse as HopGetQuoteResponse,
  VerifiedToken,
} from "@hop.ag/sdk";
import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { SUI_DECIMALS, normalizeStructTag } from "@mysten/sui/utils";
import * as Sentry from "@sentry/nextjs";
import {
  Router as AftermathRouter,
  RouterCompleteTradeRoute as AftermathRouterCompleteTradeRoute,
} from "aftermath-ts-sdk";
import BigNumber from "bignumber.js";
import {
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpDown,
  RotateCw,
} from "lucide-react";
import { ReactFlowProvider } from "reactflow";
import { toast } from "sonner";
import useSWR from "swr";
import { useLocalStorage } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";

import { SuilendClient } from "@suilend/sdk/client";
import { Action, Side } from "@suilend/sdk/types";

import Button from "@/components/shared/Button";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import TokenLogos from "@/components/shared/TokenLogos";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabel, TLabelSans } from "@/components/shared/Typography";
import RoutingDialog from "@/components/swap/RoutingDialog";
import SwapInput from "@/components/swap/SwapInput";
import SwapSlippagePopover, {
  SLIPPAGE_PERCENT_DP,
} from "@/components/swap/SwapSlippagePopover";
import TokenRatiosChart from "@/components/swap/TokenRatiosChart";
import { Skeleton } from "@/components/ui/skeleton";
import { AppData, useAppContext } from "@/contexts/AppContext";
import {
  SwapContextProvider,
  TokenDirection,
  UnifiedQuote,
  UnifiedQuoteType,
  useSwapContext,
} from "@/contexts/SwapContext";
import { useWalletContext } from "@/contexts/WalletContext";
import {
  getSubmitButtonNoValueState,
  getSubmitButtonState,
} from "@/lib/actions";
import { ParsedCoinBalance } from "@/lib/coinBalance";
import { NORMALIZED_SUI_COINTYPE, SUI_COINTYPE, isSui } from "@/lib/coinType";
import { SUI_GAS_MIN, TX_TOAST_DURATION } from "@/lib/constants";
import { formatInteger, formatPercent, formatToken } from "@/lib/format";
import { getFilteredRewards, getTotalAprPercent } from "@/lib/liquidityMining";
import track from "@/lib/track";
import { getBalanceChange } from "@/lib/transactions";
import { cn } from "@/lib/utils";

type SubmitButtonState = {
  isLoading?: boolean;
  isDisabled?: boolean;
  title?: string;
};

const PRICE_IMPACT_PERCENT_WARNING_THRESHOLD = 2;
const PRICE_IMPACT_PERCENT_DESTRUCTIVE_THRESHOLD = 25;

function Page() {
  const { address } = useWalletContext();
  const {
    refreshData,
    explorer,
    obligation,
    signExecuteAndWaitForTransaction,
    ...restAppContext
  } = useAppContext();
  const data = restAppContext.data as AppData;
  const suilendClient = restAppContext.suilendClient as SuilendClient;

  const { setTokenSymbol, reverseTokenSymbols, ...restSwapContext } =
    useSwapContext();
  const hopSdk = restSwapContext.hopSdk as HopApi;
  const aftermathSdk = restSwapContext.aftermathSdk as AftermathRouter;
  const tokens = restSwapContext.tokens as VerifiedToken[];
  const verifiedTokens = restSwapContext.verifiedTokens as VerifiedToken[];
  const tokenIn = restSwapContext.tokenIn as VerifiedToken;
  const tokenOut = restSwapContext.tokenOut as VerifiedToken;
  const coinBalancesMap = restSwapContext.coinBalancesMap as Record<
    string,
    ParsedCoinBalance
  >;

  // Balances
  const suiBalance =
    coinBalancesMap[NORMALIZED_SUI_COINTYPE]?.balance ?? new BigNumber(0);
  const tokenInBalance =
    coinBalancesMap[tokenIn.coin_type]?.balance ?? new BigNumber(0);

  // Positions
  const tokenOutDepositPosition = obligation?.deposits?.find(
    (d) => d.coinType === tokenOut.coin_type,
  );
  const tokenOutDepositPositionAmount =
    tokenOutDepositPosition?.depositedAmount ?? new BigNumber(0);

  // Deposit
  const tokenOutReserve = data.lendingMarket.reserves.find(
    (reserve) => reserve.coinType === tokenOut.coin_type,
  );
  const tokenOutReserveDepositAprPercent = tokenOutReserve
    ? getTotalAprPercent(
        Side.DEPOSIT,
        tokenOutReserve.depositAprPercent,
        getFilteredRewards(data.rewardMap[tokenOutReserve.coinType].deposit),
      )
    : undefined;

  const hasTokenOutReserve =
    !!tokenOutReserve && tokenOutReserveDepositAprPercent !== undefined;

  // Max
  const tokenInMaxCalculations = (() => {
    const result = [
      {
        reason: `Insufficient ${tokenIn.ticker} balance`,
        isDisabled: true,
        value: tokenInBalance,
      },
    ];
    if (isSui(tokenIn.coin_type))
      result.push({
        reason: `${SUI_GAS_MIN} SUI should be saved for gas`,
        isDisabled: true,
        value: tokenInBalance.minus(SUI_GAS_MIN),
      });

    return result;
  })();

  const tokenInMaxAmount = BigNumber.max(
    new BigNumber(0),
    BigNumber.min(
      ...Object.values(tokenInMaxCalculations).map((calc) => calc.value),
    ),
  ).toFixed(tokenIn.decimals, BigNumber.ROUND_DOWN);

  // Slippage
  const [slippagePercent, setSlippagePercent] = useLocalStorage<string>(
    "swapSlippage",
    "1.0",
  );

  const formatAndSetSlippagePercent = useCallback(
    (_value: string) => {
      let formattedValue;
      if (new BigNumber(_value || 0).lt(0)) formattedValue = "0";
      else if (new BigNumber(_value).gt(100)) formattedValue = "100";
      else if (!_value.includes(".")) formattedValue = _value;
      else {
        const [integers, decimals] = _value.split(".");
        const integersFormatted = formatInteger(
          integers !== "" ? parseInt(integers) : 0,
          false,
        );
        const decimalsFormatted = decimals.slice(
          0,
          Math.min(decimals.length, SLIPPAGE_PERCENT_DP),
        );
        formattedValue = `${integersFormatted}.${decimalsFormatted}`;
      }

      setSlippagePercent(formattedValue);
    },
    [setSlippagePercent],
  );

  // State
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>("");

  // Quote
  const [quoteMap, setQuoteMap] = useState<
    Record<number, UnifiedQuote | undefined>
  >({});
  const quote = (() => {
    const timestamps = Object.entries(quoteMap)
      .filter(
        ([timestamp, quote]) =>
          quote !== undefined &&
          quote.coin_type_in === tokenIn.coin_type &&
          quote.coin_type_out === tokenOut.coin_type,
      )
      .map(([timestamp]) => +timestamp);

    return timestamps.length === 0
      ? undefined
      : quoteMap[Math.max(...timestamps)];
  })();
  const quoteAmountIn = quote
    ? BigNumber(quote.amount_in.toString())
    : undefined;
  const quoteAmountOut = quote
    ? BigNumber(quote.amount_out.toString())
    : undefined;

  const isFetchingQuote = (() => {
    const timestamps = Object.keys(quoteMap).map((timestamp) => +timestamp);

    return timestamps.length === 0
      ? false
      : quoteMap[Math.max(...timestamps)] === undefined;
  })();

  const fetchQuote = useCallback(
    async (
      _tokenIn = tokenIn,
      _tokenOut = tokenOut,
      _value = value,
      _timestamp = new Date().getTime(),
    ) => {
      if (_tokenIn.coin_type === _tokenOut.coin_type) return;
      if (new BigNumber(_value || 0).lte(0)) return;

      setQuoteMap((o) => ({ ...o, [_timestamp]: undefined }));

      try {
        const params = {
          token_in: _tokenIn.coin_type,
          token_out: _tokenOut.coin_type,
          amount_in: BigInt(
            new BigNumber(_value)
              .times(10 ** _tokenIn.decimals)
              .integerValue(BigNumber.ROUND_DOWN)
              .toString(),
          ),
        };

        // Use best quote
        const results = await Promise.allSettled<
          | { type: UnifiedQuoteType.HOP; quote: HopGetQuoteResponse }
          | {
              type: UnifiedQuoteType.AFTERMATH;
              quote: AftermathRouterCompleteTradeRoute;
            }
        >([
          new Promise(async (resolve, reject) => {
            try {
              const quote = await hopSdk.fetchQuote(params);
              resolve({ type: UnifiedQuoteType.HOP, quote });
            } catch (err) {
              reject(err);
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              const quote =
                await aftermathSdk.getCompleteTradeRouteGivenAmountIn({
                  coinInType: params.token_in,
                  coinOutType: params.token_out,
                  coinInAmount: params.amount_in,
                });
              resolve({ type: UnifiedQuoteType.AFTERMATH, quote });
            } catch (err) {
              reject(err);
            }
          }),
        ]);
        console.log("results:", results);

        const rawQuotes = results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
        if (rawQuotes.length === 0) throw new Error("No route found");

        const unifiedQuotes = rawQuotes
          .map(({ type, quote }) => {
            if (type === UnifiedQuoteType.HOP) {
              const hopQuote = quote as HopGetQuoteResponse;

              hopQuote.trade.amount_in.token = normalizeStructTag(
                hopQuote.trade.amount_in.token,
              );
              hopQuote.trade.amount_out.token = normalizeStructTag(
                hopQuote.trade.amount_out.token,
              );
              for (const node of Object.values(hopQuote.trade.nodes)) {
                node.amount_in.token = normalizeStructTag(node.amount_in.token);
                node.amount_out.token = normalizeStructTag(
                  node.amount_out.token,
                );
              }

              return {
                id: uuidv4(),
                amount_in: new BigNumber(
                  hopQuote.trade.amount_in.amount.toString(),
                ).div(10 ** _tokenIn.decimals),
                amount_out: new BigNumber(
                  hopQuote.trade.amount_out.amount.toString(),
                ).div(10 ** _tokenOut.decimals),
                coin_type_in: hopQuote.trade.amount_in.token,
                coin_type_out: hopQuote.trade.amount_out.token,
                type: UnifiedQuoteType.HOP,
                quote: hopQuote,
              };
            } else if (type === UnifiedQuoteType.AFTERMATH) {
              const aftermathQuote = quote as AftermathRouterCompleteTradeRoute;

              aftermathQuote.coinIn.type = normalizeStructTag(
                aftermathQuote.coinIn.type,
              );
              aftermathQuote.coinOut.type = normalizeStructTag(
                aftermathQuote.coinOut.type,
              );
              for (const route of aftermathQuote.routes) {
                route.coinIn.type = normalizeStructTag(route.coinIn.type);
                route.coinOut.type = normalizeStructTag(route.coinOut.type);

                for (const path of route.paths) {
                  path.coinIn.type = normalizeStructTag(path.coinIn.type);
                  path.coinOut.type = normalizeStructTag(path.coinOut.type);
                  path.pool.assets[0] = normalizeStructTag(path.pool.assets[0]);
                  path.pool.assets[1] = normalizeStructTag(path.pool.assets[1]);
                }
              }

              return {
                id: uuidv4(),
                amount_in: new BigNumber(
                  aftermathQuote.coinIn.amount.toString(),
                ).div(10 ** _tokenIn.decimals),
                amount_out: new BigNumber(
                  aftermathQuote.coinOut.amount.toString(),
                ).div(10 ** _tokenOut.decimals),
                coin_type_in: aftermathQuote.coinIn.type,
                coin_type_out: aftermathQuote.coinOut.type,
                type: UnifiedQuoteType.AFTERMATH,
                quote: aftermathQuote,
              };
            } else return undefined;
          })
          .filter(Boolean) as UnifiedQuote[];

        const sortedUnifiedQuotes = unifiedQuotes
          .slice()
          .sort((a, b) => +b.amount_out.minus(a.amount_out));
        const unifiedQuote = sortedUnifiedQuotes[0];

        setQuoteMap((o) => ({ ...o, [_timestamp]: unifiedQuote }));
        return unifiedQuote;
      } catch (err) {
        toast.error("Failed to get quote", {
          description:
            err instanceof AggregateError
              ? "No route found"
              : (err as Error)?.message || "An unknown error occurred",
        });
        console.error(err);

        setQuoteMap((o) => {
          delete o[_timestamp];
          return o;
        });
      }
    },
    [tokenIn, tokenOut, value, hopSdk, aftermathSdk],
  );

  const fetchQuoteWrapper = useCallback(() => fetchQuote(), [fetchQuote]);

  useSWR<UnifiedQuote | undefined>("quote", fetchQuoteWrapper, {
    refreshInterval: 30 * 1000,
    onSuccess: (data) => {
      console.log("Fetched quote", data);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  // Value
  const formatAndSetValue = useCallback(
    (_value: string, token: VerifiedToken) => {
      let formattedValue;
      if (new BigNumber(_value || 0).lt(0)) formattedValue = _value;
      else if (!_value.includes(".")) formattedValue = _value;
      else {
        const [integers, decimals] = _value.split(".");
        const integersFormatted = formatInteger(
          integers !== "" ? parseInt(integers) : 0,
          false,
        );
        const decimalsFormatted = decimals.slice(
          0,
          Math.min(decimals.length, token.decimals),
        );
        formattedValue = `${integersFormatted}.${decimalsFormatted}`;
      }

      setValue(formattedValue);
    },
    [],
  );

  const onValueChange = (_value: string) => {
    formatAndSetValue(_value, tokenIn);
    if (new BigNumber(_value || 0).gt(0)) fetchQuote(tokenIn, tokenOut, _value);
    else setQuoteMap({});
  };

  const useMaxValueWrapper = () => {
    formatAndSetValue(tokenInMaxAmount, tokenIn);
    if (new BigNumber(tokenInMaxAmount).gt(0))
      fetchQuote(tokenIn, tokenOut, tokenInMaxAmount);
    else setQuoteMap({});

    inputRef.current?.focus();
  };

  // USD prices - historical
  const HISTORICAL_USD_PRICES_INTERVAL = "5m";
  const HISTORICAL_USD_PRICES_INTERVAL_S = 5 * 60;

  type HistoricalPriceData = {
    timestampS: number;
    value: number;
  };

  const [historicalUsdPricesMap, setHistoricalUsdPriceMap] = useState<
    Record<string, HistoricalPriceData[]>
  >({});
  const tokenInHistoricalUsdPrices = historicalUsdPricesMap[tokenIn.coin_type];
  const tokenOutHistoricalUsdPrices =
    historicalUsdPricesMap[tokenOut.coin_type];

  const fetchTokenHistoricalUsdPrices = useCallback(
    async (token: VerifiedToken) => {
      try {
        const url = `https://public-api.birdeye.so/defi/history_price?address=${isSui(token.coin_type) ? SUI_COINTYPE : token.coin_type}&address_type=token&type=${HISTORICAL_USD_PRICES_INTERVAL}&time_from=${Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60}&time_to=${Math.floor(new Date().getTime() / 1000)}`;
        const res = await fetch(url, {
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_BIRDEYE_API_KEY as string,
            "x-chain": "sui",
          },
        });
        const json = await res.json();
        if (json.data?.items)
          setHistoricalUsdPriceMap((o) => ({
            ...o,
            [token.coin_type]: json.data.items.map(
              (item: any) =>
                ({
                  timestampS: item.unixTime,
                  value: item.value,
                }) as HistoricalPriceData,
            ),
          }));
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  const fetchedInitialTokenHistoricalUsdPricesRef = useRef<boolean>(false);
  useEffect(() => {
    if (fetchedInitialTokenHistoricalUsdPricesRef.current) return;

    fetchTokenHistoricalUsdPrices(tokenIn);
    fetchTokenHistoricalUsdPrices(tokenOut);
    fetchedInitialTokenHistoricalUsdPricesRef.current = true;
  }, [fetchTokenHistoricalUsdPrices, tokenIn, tokenOut]);

  // USD prices - current
  const tokenInUsdPrice =
    tokenInHistoricalUsdPrices !== undefined
      ? tokenInHistoricalUsdPrices[tokenInHistoricalUsdPrices.length - 1]?.value
      : undefined;
  const tokenOutUsdPrice =
    tokenOutHistoricalUsdPrices !== undefined
      ? tokenOutHistoricalUsdPrices[tokenOutHistoricalUsdPrices.length - 1]
          ?.value
      : undefined;

  const tokenInUsdValue =
    quoteAmountIn !== undefined && tokenInUsdPrice !== undefined
      ? quoteAmountIn.times(tokenInUsdPrice)
      : undefined;
  const tokenOutUsdValue =
    quoteAmountOut !== undefined && tokenOutUsdPrice !== undefined
      ? quoteAmountOut.times(tokenOutUsdPrice)
      : undefined;

  // Ratios
  const [isInverted, setIsInverted] = useState<boolean>(false);

  const currentTokenRatio =
    tokenInUsdPrice !== undefined && tokenOutUsdPrice !== undefined
      ? new BigNumber(!isInverted ? tokenInUsdPrice : tokenOutUsdPrice).div(
          !isInverted ? tokenOutUsdPrice : tokenInUsdPrice,
        )
      : undefined;
  const currentTokenRatioDp =
    currentTokenRatio !== undefined
      ? Math.max(0, -Math.floor(Math.log10(+currentTokenRatio)) - 1) + 4
      : undefined;

  const historicalTokenRatios = (() => {
    if (
      tokenInHistoricalUsdPrices === undefined ||
      tokenOutHistoricalUsdPrices === undefined
    )
      return undefined;

    const minTimestampS = Math.max(
      Math.min(...tokenInHistoricalUsdPrices.map((item) => item.timestampS)),
      Math.min(...tokenOutHistoricalUsdPrices.map((item) => item.timestampS)),
    );
    const maxTimestampS = Math.min(
      Math.max(...tokenInHistoricalUsdPrices.map((item) => item.timestampS)),
      Math.max(...tokenOutHistoricalUsdPrices.map((item) => item.timestampS)),
    );

    const timestampsS: number[] = [minTimestampS];
    while (timestampsS[timestampsS.length - 1] < maxTimestampS) {
      timestampsS.push(
        timestampsS[timestampsS.length - 1] + HISTORICAL_USD_PRICES_INTERVAL_S,
      );
    }

    return timestampsS
      .filter((_, index) => index % 2 === 0) // Every second value
      .map((timestampS) => ({
        timestampS,
        ratio: +new BigNumber(
          (!isInverted
            ? tokenInHistoricalUsdPrices
            : tokenOutHistoricalUsdPrices
          ).find((item) => item.timestampS === timestampS)?.value ?? 0,
        ).div(
          (!isInverted
            ? tokenOutHistoricalUsdPrices
            : tokenInHistoricalUsdPrices
          ).find((item) => item.timestampS === timestampS)?.value ?? 1,
        ),
      }));
  })();

  const tokenRatio24hAgo =
    historicalTokenRatios !== undefined
      ? historicalTokenRatios[0].ratio
      : undefined;
  const tokenRatio24hChangePercent =
    currentTokenRatio !== undefined && tokenRatio24hAgo !== undefined
      ? new BigNumber(currentTokenRatio.minus(tokenRatio24hAgo))
          .div(tokenRatio24hAgo)
          .times(100)
      : undefined;

  // Ratios - quote
  const quoteRatio =
    quoteAmountOut !== undefined && quoteAmountIn !== undefined
      ? (!isInverted ? quoteAmountOut : quoteAmountIn).div(
          !isInverted ? quoteAmountIn : quoteAmountOut,
        )
      : undefined;

  // Price impact
  useEffect(() => {
    if (tokenInUsdPrice === undefined) return;

    const _value = new BigNumber(1)
      .div(tokenInUsdPrice)
      .toFixed(tokenIn.decimals, BigNumber.ROUND_DOWN);
    fetchQuote(tokenIn, tokenOut, _value, -1);
  }, [tokenInUsdPrice, tokenIn, fetchQuote, tokenOut]);

  const priceImpactQuote = quoteMap[-1];
  const priceImpactQuoteAmountIn = priceImpactQuote
    ? BigNumber(priceImpactQuote.amount_in.toString())
    : undefined;
  const priceImpactQuoteAmountOut = priceImpactQuote
    ? BigNumber(priceImpactQuote.amount_out.toString())
    : undefined;

  const priceImpactQuoteRatio =
    priceImpactQuoteAmountOut !== undefined &&
    priceImpactQuoteAmountIn !== undefined
      ? (!isInverted
          ? priceImpactQuoteAmountOut
          : priceImpactQuoteAmountIn
        ).div(
          !isInverted ? priceImpactQuoteAmountIn : priceImpactQuoteAmountOut,
        )
      : undefined;

  const priceImpactPercent =
    quoteRatio !== undefined && priceImpactQuoteRatio !== undefined
      ? BigNumber.max(
          0,
          new BigNumber(100).minus(
            (!isInverted
              ? quoteRatio.div(priceImpactQuoteRatio)
              : priceImpactQuoteRatio.div(quoteRatio)
            ).times(100),
          ),
        )
      : undefined;

  // Reverse tokens
  const reverseTokens = () => {
    formatAndSetValue(value, tokenOut);
    if (new BigNumber(value || 0).gt(0)) fetchQuote(tokenOut, tokenIn, value);
    else setQuoteMap({});

    reverseTokenSymbols();

    inputRef.current?.focus();
  };

  // Select token
  const onTokenCoinTypeChange = (
    coinType: string,
    direction: TokenDirection,
  ) => {
    const _token = tokens.find((t) => t.coin_type === coinType);
    if (!_token) return;

    setQuoteMap({});
    if (
      _token.coin_type ===
      (direction === TokenDirection.IN ? tokenOut : tokenIn).coin_type
    )
      reverseTokens();
    else {
      const isVerifiedToken = verifiedTokens.find(
        (t) => t.coin_type === coinType,
      );
      setTokenSymbol(
        isVerifiedToken ? _token.ticker : _token.coin_type,
        direction,
      );

      fetchQuote(
        direction === TokenDirection.IN ? _token : tokenIn,
        direction === TokenDirection.IN ? tokenOut : _token,
        value,
      );
      if (historicalUsdPricesMap[_token.coin_type] === undefined)
        fetchTokenHistoricalUsdPrices(_token);
    }

    inputRef.current?.focus();
  };

  // Swap
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [isSwappingAndDepositing, setIsSwappingAndDepositing] =
    useState<boolean>(false);

  const swapButtonState: SubmitButtonState = (() => {
    if (!address) return { isDisabled: true, title: "Connect wallet" };
    if (isSwapping) return { isDisabled: true, isLoading: true };

    if (value === "") return { isDisabled: true, title: "Enter an amount" };
    if (new BigNumber(value).lt(0))
      return { isDisabled: true, title: "Enter a +ve amount" };
    if (new BigNumber(value).eq(0))
      return { isDisabled: true, title: "Enter a non-zero amount" };

    if (suiBalance.lt(SUI_GAS_MIN))
      return {
        isDisabled: true,
        title: `${SUI_GAS_MIN} SUI should be saved for gas`,
      };

    for (const calc of tokenInMaxCalculations) {
      if (new BigNumber(value).gt(calc.value))
        return { isDisabled: calc.isDisabled, title: calc.reason };
    }

    return {
      title: "Swap",
      isDisabled: !quote || isSwappingAndDepositing,
    };
  })();

  const swapAndDepositButtonDisabledTooltip = (() => {
    if (!hasTokenOutReserve || quoteAmountOut === undefined) return;

    const depositSubmitButtonNoValueState = getSubmitButtonNoValueState(
      Action.DEPOSIT,
      data.lendingMarket.reserves,
      tokenOutReserve,
      data.obligations,
      obligation,
    )();
    const depositSubmitButtonState = getSubmitButtonState(
      Action.DEPOSIT,
      tokenOutReserve,
      quoteAmountOut.plus(isSui(tokenOutReserve.coinType) ? SUI_GAS_MIN : 0),
      data,
      obligation,
    )(quoteAmountOut.toString());

    if (
      depositSubmitButtonNoValueState !== undefined &&
      depositSubmitButtonNoValueState.isDisabled
    )
      return depositSubmitButtonNoValueState.title;
    if (
      depositSubmitButtonState !== undefined &&
      depositSubmitButtonState.isDisabled
    )
      return depositSubmitButtonState.title;
  })();

  const swapAndDepositButtonState: SubmitButtonState = (() => {
    if (!hasTokenOutReserve)
      return { isDisabled: true, title: "Cannot deposit this token" };
    if (isSwappingAndDepositing) return { isDisabled: true, isLoading: true };

    return {
      title: `Swap and deposit for ${formatPercent(tokenOutReserveDepositAprPercent)} APR`,
      isDisabled:
        !!swapAndDepositButtonDisabledTooltip ||
        swapButtonState.isDisabled ||
        isSwapping,
    };
  })();

  const getTransactionForUnifiedQuote = async (
    quote: UnifiedQuote,
    slippagePercent: number,
    address: string,
    isDepositing: boolean,
  ): Promise<{
    transaction: Transaction;
    outputCoin: TransactionResult | undefined;
  }> => {
    if (quote.type === UnifiedQuoteType.HOP) {
      const res = await hopSdk.fetchTx({
        trade: (quote.quote as HopGetQuoteResponse).trade,
        sui_address: address,
        gas_budget: 0.25 * 10 ** SUI_DECIMALS, // Set to 0.25 SUI
        max_slippage_bps: slippagePercent * 100,
        return_output_coin_argument: isDepositing,
      });

      return {
        transaction: res.transaction,
        outputCoin: res.output_coin,
      };
    } else if (quote.type === UnifiedQuoteType.AFTERMATH) {
      if (isDepositing) {
        const res = await aftermathSdk.addTransactionForCompleteTradeRouteV0({
          tx: new Transaction() as any,
          walletAddress: address,
          completeRoute: quote.quote as AftermathRouterCompleteTradeRoute,
          slippage: slippagePercent / 100,
        });

        return {
          transaction: res.tx as unknown as Transaction,
          outputCoin: res.coinOutId as TransactionResult | undefined,
        };
      } else {
        const transaction =
          await aftermathSdk.getTransactionForCompleteTradeRouteV0({
            walletAddress: address,
            completeRoute: quote.quote as AftermathRouterCompleteTradeRoute,
            slippage: slippagePercent / 100,
          });

        return {
          transaction: transaction as unknown as Transaction,
          outputCoin: undefined,
        };
      }
    } else throw new Error("Unknown quote type");
  };

  const swap = async (deposit?: boolean) => {
    if (!address) throw new Error("Wallet not connected");
    if (!quote) throw new Error("Quote not found");
    if (deposit && !hasTokenOutReserve)
      throw new Error("Cannot deposit this token");

    const isDepositing = !!(deposit && hasTokenOutReserve);

    try {
      const { transaction, outputCoin } = await getTransactionForUnifiedQuote(
        quote,
        +slippagePercent,
        address,
        isDepositing,
      );
      transaction.setGasBudget(SUI_GAS_MIN * 10 ** SUI_DECIMALS);

      if (isDepositing) {
        if (!outputCoin) throw new Error("Missing coin to deposit");

        const obligationOwnerCap = data.obligationOwnerCaps?.find(
          (o) => o.obligationId === obligation?.id,
        );

        await suilendClient.depositCoin(
          address,
          outputCoin,
          tokenOutReserve.coinType,
          transaction,
          obligationOwnerCap?.id,
        );
      }

      const res = await signExecuteAndWaitForTransaction(transaction);
      return res;
    } catch (err) {
      Sentry.captureException(err);
      console.error(err);
      throw err;
    }
  };

  const onSwapClick = async (deposit?: boolean) => {
    if (deposit) {
      if (swapAndDepositButtonState.isDisabled) return;
    } else {
      if (swapButtonState.isDisabled) return;
    }
    if (quoteAmountOut === undefined || isFetchingQuote) return;

    (deposit ? setIsSwappingAndDepositing : setIsSwapping)(true);

    try {
      const res = await swap(deposit);
      const txUrl = explorer.buildTxUrl(res.digest);

      const balanceChangeOut = getBalanceChange(
        res,
        address!,
        tokenOut.coin_type,
        tokenOut.decimals,
      );

      toast.success(
        [
          "Swapped",
          formatToken(new BigNumber(value), {
            dp: tokenIn.decimals,
            trimTrailingZeros: true,
          }),
          tokenIn.ticker,
          "for",
          formatToken(
            !deposit && balanceChangeOut !== undefined
              ? balanceChangeOut
              : quoteAmountOut, // When swapping+depositing, the out asset doesn't reach the wallet as it is immediately deposited
            { dp: tokenOut.decimals, trimTrailingZeros: true },
          ),
          tokenOut.ticker,
          ...(deposit ? [`and deposited the ${tokenOut.ticker}`] : []),
        ].join(" "),
        {
          icon: <ArrowRightLeft className="h-5 w-5 text-success" />,
          action: (
            <TextLink className="block" href={txUrl}>
              View tx on {explorer.name}
            </TextLink>
          ),
          duration: TX_TOAST_DURATION,
        },
      );
      formatAndSetValue("", tokenIn);

      const properties: Record<string, string | number> = {
        assetIn: tokenIn.ticker,
        assetOut: tokenOut.ticker,
        amountIn: value,
        amountOut: formatToken(quoteAmountOut, {
          dp: tokenOut.decimals,
          useGrouping: false,
        }),
        deposit: deposit ? "true" : "false",
      };
      if (tokenInUsdValue !== undefined)
        properties.amountInUsd = formatToken(tokenInUsdValue, {
          dp: 2,
          useGrouping: false,
        });
      if (tokenOutUsdValue !== undefined)
        properties.amountOutUsd = formatToken(tokenOutUsdValue, {
          dp: 2,
          useGrouping: false,
        });

      track("swap_success", properties);
    } catch (err) {
      toast.error("Failed to swap", {
        description: (err as Error)?.message || "An unknown error occurred",
        duration: TX_TOAST_DURATION,
      });
    } finally {
      (deposit ? setIsSwappingAndDepositing : setIsSwapping)(false);
      inputRef.current?.focus();
      await refreshData();
    }
  };

  return (
    <>
      <Head>
        <title>Suilend Swap</title>
      </Head>

      <div className="flex w-full max-w-[28rem] flex-col items-center gap-8">
        <div className="relative flex w-full flex-col">
          {/* Settings */}
          <div className="mb-4 flex flex-row items-center justify-between gap-2">
            <Button
              className="h-7 w-7 rounded-full bg-muted/15 px-0"
              tooltip="Refresh"
              icon={<RotateCw className="h-3 w-3" />}
              variant="ghost"
              onClick={fetchQuoteWrapper}
            >
              Refresh
            </Button>

            <SwapSlippagePopover
              slippagePercent={slippagePercent}
              onSlippagePercentChange={formatAndSetSlippagePercent}
            />
          </div>

          {/* In */}
          <div className="relative z-[1]">
            <SwapInput
              ref={inputRef}
              title="You're paying"
              autoFocus
              value={value}
              onChange={onValueChange}
              usdValue={tokenInUsdValue}
              token={tokenIn}
              onSelectToken={(t: VerifiedToken) =>
                onTokenCoinTypeChange(t.coin_type, TokenDirection.IN)
              }
              onBalanceClick={useMaxValueWrapper}
            />
          </div>

          {/* Reverse */}
          <div className="relative z-[2] -my-3 w-max self-center rounded-full bg-background">
            <Button
              className="rounded-full px-0"
              icon={<ArrowUpDown />}
              variant="secondary"
              size="icon"
              onClick={reverseTokens}
            >
              Reverse
            </Button>
          </div>

          {/* Out */}
          <div className="relative z-[1] mb-4">
            <div className="relative z-[2] w-full">
              <SwapInput
                title="To receive"
                value={
                  new BigNumber(value || 0).gt(0) &&
                  quoteAmountOut !== undefined
                    ? formatToken(quoteAmountOut, {
                        dp: tokenOut.decimals,
                        useGrouping: false,
                      })
                    : ""
                }
                isValueLoading={isFetchingQuote}
                usdValue={tokenOutUsdValue}
                token={tokenOut}
                onSelectToken={(t: VerifiedToken) =>
                  onTokenCoinTypeChange(t.coin_type, TokenDirection.OUT)
                }
              />
            </div>

            {hasTokenOutReserve && (
              <div className="relative z-[1] -mt-2 flex w-full flex-row flex-wrap justify-end gap-x-2 gap-y-1 rounded-b-md bg-border px-3 pb-2 pt-4">
                <div className="flex flex-row items-center gap-2">
                  <TLabelSans>Deposited</TLabelSans>
                  <TBody className="text-xs">
                    {formatToken(tokenOutDepositPositionAmount, {
                      exact: false,
                    })}{" "}
                    {tokenOut.ticker}
                  </TBody>
                </div>
              </div>
            )}
          </div>

          {/* Parameters */}
          {new BigNumber(value || 0).gt(0) && (
            <div className="mb-4 flex w-full flex-col gap-2">
              {/* Price impact */}
              {priceImpactPercent !== undefined ? (
                <div className="w-max">
                  <TLabelSans
                    className={cn(
                      priceImpactPercent.gte(
                        PRICE_IMPACT_PERCENT_WARNING_THRESHOLD,
                      ) &&
                        cn(
                          "font-medium",
                          priceImpactPercent.lt(
                            PRICE_IMPACT_PERCENT_DESTRUCTIVE_THRESHOLD,
                          )
                            ? "text-warning"
                            : "text-destructive",
                        ),
                    )}
                  >
                    {priceImpactPercent.gte(
                      PRICE_IMPACT_PERCENT_WARNING_THRESHOLD,
                    ) && (
                      <AlertTriangle className="mb-0.5 mr-1 inline h-3 w-3" />
                    )}
                    {formatPercent(BigNumber.max(0, priceImpactPercent))} Price
                    impact
                  </TLabelSans>
                </div>
              ) : (
                <Skeleton className="h-4 w-40" />
              )}

              {/* Routing */}
              <div className="w-full">
                {quote ? (
                  <ReactFlowProvider>
                    <RoutingDialog quote={quote} />
                  </ReactFlowProvider>
                ) : (
                  <Skeleton className="h-4 w-40" />
                )}
              </div>

              {/* Quote */}
              <div className="w-full">
                {quoteRatio !== undefined ? (
                  <div
                    className="group flex w-max cursor-pointer flex-row items-center gap-2"
                    onClick={() => setIsInverted((is) => !is)}
                  >
                    <TLabel className="transition-colors group-hover:text-foreground">
                      {"1 "}
                      {(!isInverted ? tokenIn : tokenOut).ticker}{" "}
                      <span className="font-sans">≈</span>{" "}
                      {formatToken(quoteRatio, {
                        dp: (!isInverted ? tokenOut : tokenIn).decimals,
                      })}{" "}
                      {(!isInverted ? tokenOut : tokenIn).ticker}
                    </TLabel>
                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-40" />
                )}
              </div>
            </div>
          )}

          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-col gap-[1px] rounded-sm">
              {/* Swap */}
              <Button
                className={cn(
                  "h-auto min-h-14 w-full py-2",
                  hasTokenOutReserve && "rounded-b-none",
                )}
                labelClassName="text-wrap uppercase"
                style={{ overflowWrap: "anywhere" }}
                disabled={swapButtonState.isDisabled}
                onClick={() => onSwapClick()}
              >
                {swapButtonState.isLoading ? (
                  <Spinner size="md" />
                ) : (
                  swapButtonState.title
                )}
              </Button>

              {/* Swap and deposit */}
              {hasTokenOutReserve && (
                <Tooltip title={swapAndDepositButtonDisabledTooltip}>
                  <Button
                    className={cn(
                      "rounded-t-none",
                      swapAndDepositButtonState.isDisabled &&
                        "!cursor-default !bg-secondary opacity-50",
                    )}
                    labelClassName="uppercase text-xs"
                    variant="secondary"
                    onClick={
                      swapAndDepositButtonState.isDisabled
                        ? undefined
                        : () => onSwapClick(true)
                    }
                  >
                    {swapAndDepositButtonState.isLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      swapAndDepositButtonState.title
                    )}
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Tokens */}
          <div className="mt-6 flex w-full flex-row flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div className="flex flex-col gap-1.5">
              <div
                className="group flex cursor-pointer flex-row items-center gap-2"
                onClick={() => setIsInverted((is) => !is)}
              >
                <TokenLogos
                  className="h-4 w-4"
                  tokens={(!isInverted
                    ? [tokenIn, tokenOut]
                    : [tokenOut, tokenIn]
                  ).map((t) => ({
                    coinType: t.coin_type,
                    symbol: t.ticker,
                    iconUrl: t.icon_url,
                  }))}
                />

                <TBody>
                  {(!isInverted ? tokenIn : tokenOut).ticker}
                  <span className="font-sans">/</span>
                  {(!isInverted ? tokenOut : tokenIn).ticker}
                </TBody>

                <ArrowRightLeft className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>

              {currentTokenRatio !== undefined &&
              currentTokenRatioDp !== undefined &&
              tokenRatio24hChangePercent !== undefined ? (
                <TBody className="text-xs">
                  {formatToken(currentTokenRatio, {
                    dp: currentTokenRatioDp,
                    exact: true,
                  })}{" "}
                  <span
                    className={cn(
                      tokenRatio24hChangePercent.gt(0) && "text-success",
                      tokenRatio24hChangePercent.eq(0) &&
                        "text-muted-foreground",
                      tokenRatio24hChangePercent.lt(0) && "text-destructive",
                    )}
                  >
                    {tokenRatio24hChangePercent.gt(0) && "+"}
                    {tokenRatio24hChangePercent.lt(0) && "-"}
                    {formatPercent(tokenRatio24hChangePercent.abs())}
                  </span>
                </TBody>
              ) : (
                <Skeleton className="h-4 w-40" />
              )}
            </div>

            <Link
              className="block flex min-w-32 max-w-56 flex-1 cursor-pointer"
              target="_blank"
              href={`https://birdeye.so/token/${isSui(tokenIn.coin_type) ? SUI_COINTYPE : tokenIn.coin_type}?chain=sui`}
            >
              <div className="pointer-events-none h-6 w-full pl-6">
                {historicalTokenRatios !== undefined && (
                  <TokenRatiosChart data={historicalTokenRatios} />
                )}
              </div>
            </Link>
          </div>
        </div>

        <TLabelSans className="opacity-50">
          {"Powered by "}
          <TextLink
            className="text-muted-foreground decoration-muted-foreground/50"
            href="https://hop.ag/"
            noIcon
          >
            Hop
          </TextLink>
          {" & "}
          <TextLink
            className="text-muted-foreground decoration-muted-foreground/50"
            href="https://aftermath.finance/trade"
            noIcon
          >
            Aftermath
          </TextLink>
        </TLabelSans>
      </div>
    </>
  );
}

export default function Swap() {
  return (
    <SwapContextProvider>
      <Page />
    </SwapContextProvider>
  );
}
