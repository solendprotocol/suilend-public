import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  HopApi,
  GetQuoteResponse as HopGetQuoteResponse,
  VerifiedToken,
} from "@hop.ag/sdk";
import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { normalizeStructTag } from "@mysten/sui/utils";
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
import { Side } from "@suilend/sdk/types";

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
import TokensRatioChart from "@/components/swap/TokensRatioChart";
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
import { formatPercent, formatToken } from "@/lib/format";
import { getFilteredRewards, getTotalAprPercent } from "@/lib/liquidityMining";
import track from "@/lib/track";
import { Action } from "@/lib/types";
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
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;

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
      if (new BigNumber(_value || 0).lt(0)) setSlippagePercent("0");
      else if (new BigNumber(_value).gt(100)) setSlippagePercent("100");
      else {
        if (_value.includes(".")) {
          const [whole, decimals] = _value.split(".");
          setSlippagePercent(
            `${whole}.${decimals.slice(0, Math.min(decimals.length, SLIPPAGE_PERCENT_DP))}`,
          );
        } else setSlippagePercent(_value);
      }
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

  const quoteRatio =
    quoteAmountOut !== undefined && quoteAmountIn !== undefined
      ? quoteAmountOut.div(quoteAmountIn)
      : undefined;

  const [isQuoteRatioInverted, setIsQuoteRatioInverted] =
    useState<boolean>(false);

  const isFetchingQuote = (() => {
    const timestamps = Object.keys(quoteMap).map((timestamp) => +timestamp);

    return timestamps.length === 0
      ? false
      : quoteMap[Math.max(...timestamps)] === undefined;
  })();

  const fetchQuote = useCallback(
    async (_tokenIn = tokenIn, _tokenOut = tokenOut, _value = value) => {
      if (_tokenIn.coin_type === _tokenOut.coin_type) return;
      if (new BigNumber(_value || 0).lte(0)) return;

      const timestamp = new Date().getTime();
      setQuoteMap((o) => ({ ...o, [timestamp]: undefined }));

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

        // Use fastest quote
        const fastestQuoteResult = await Promise.any<
          | { type: UnifiedQuoteType.HOP; result: HopGetQuoteResponse }
          | {
              type: UnifiedQuoteType.AFTERMATH;
              result: AftermathRouterCompleteTradeRoute;
            }
        >([
          new Promise(async (resolve, reject) => {
            try {
              const result = await hopSdk.fetchQuote(params);
              resolve({ type: UnifiedQuoteType.HOP, result });
            } catch (err) {
              reject(err);
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              const result =
                await aftermathSdk.getCompleteTradeRouteGivenAmountIn({
                  coinInType: params.token_in,
                  coinOutType: params.token_out,
                  coinInAmount: params.amount_in,
                });
              resolve({ type: UnifiedQuoteType.AFTERMATH, result });
            } catch (err) {
              reject(err);
            }
          }),
        ]);
        console.log(
          "fastestQuoteResult:",
          fastestQuoteResult.type,
          fastestQuoteResult.result,
        );

        if (fastestQuoteResult === undefined) throw new Error("No route found");

        let unifiedQuote: UnifiedQuote | undefined;
        if (fastestQuoteResult.type === UnifiedQuoteType.HOP) {
          const hopQuote = fastestQuoteResult.result as HopGetQuoteResponse;

          hopQuote.trade.amount_in.token = normalizeStructTag(
            hopQuote.trade.amount_in.token,
          );
          hopQuote.trade.amount_out.token = normalizeStructTag(
            hopQuote.trade.amount_out.token,
          );
          for (const node of Object.values(hopQuote.trade.nodes)) {
            node.amount_in.token = normalizeStructTag(node.amount_in.token);
            node.amount_out.token = normalizeStructTag(node.amount_out.token);
          }

          unifiedQuote = {
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
        } else if (fastestQuoteResult.type === UnifiedQuoteType.AFTERMATH) {
          const aftermathQuote =
            fastestQuoteResult.result as AftermathRouterCompleteTradeRoute;

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

          unifiedQuote = {
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
        }

        setQuoteMap((o) => ({ ...o, [timestamp]: unifiedQuote }));
        return unifiedQuote;
      } catch (err) {
        toast.error("Failed to get quote", {
          description: (err as Error)?.message || "An unknown error occurred",
        });
        console.error(err);

        setQuoteMap((o) => {
          delete o[timestamp];
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
      if (new BigNumber(_value || 0).lte(0)) setValue(_value);
      else if (!_value.includes(".")) setValue(_value);
      else {
        const [whole, decimals] = _value.split(".");
        setValue(
          `${whole}.${decimals.slice(0, Math.min(decimals.length, token.decimals))}`,
        );
      }
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

  // Historical USD prices
  const HISTORICAL_PRICES_INTERVAL = "3m";
  const HISTORICAL_PRICES_INTERVAL_S = 3 * 60;

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

  const tokenInCurrentUsdPrice =
    tokenInHistoricalUsdPrices !== undefined
      ? tokenInHistoricalUsdPrices[tokenInHistoricalUsdPrices.length - 1]?.value
      : undefined;
  const tokenOutCurrentUsdPrice =
    tokenOutHistoricalUsdPrices !== undefined
      ? tokenOutHistoricalUsdPrices[tokenOutHistoricalUsdPrices.length - 1]
          ?.value
      : undefined;

  const tokenInUsdValue =
    quoteAmountIn !== undefined && tokenInCurrentUsdPrice !== undefined
      ? quoteAmountIn.times(tokenInCurrentUsdPrice)
      : undefined;
  const tokenOutUsdValue =
    quoteAmountOut !== undefined && tokenOutCurrentUsdPrice !== undefined
      ? quoteAmountOut.times(tokenOutCurrentUsdPrice)
      : undefined;

  const tokensCurrentRatio =
    tokenInCurrentUsdPrice !== undefined &&
    tokenOutCurrentUsdPrice !== undefined
      ? new BigNumber(tokenInCurrentUsdPrice).div(tokenOutCurrentUsdPrice)
      : undefined;
  const tokensCurrentRatioDp =
    tokensCurrentRatio !== undefined
      ? Math.max(0, -Math.floor(Math.log10(+tokensCurrentRatio)) - 1) + 4
      : undefined;

  const tokensHistoricalRatios = (() => {
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
        timestampsS[timestampsS.length - 1] + HISTORICAL_PRICES_INTERVAL_S,
      );
    }

    return timestampsS
      .filter((timestampS, index) => index % 3 === 0) // Every third value
      .map((timestampS) => ({
        timestampS,
        ratio: +new BigNumber(
          tokenInHistoricalUsdPrices.find(
            (item) => item.timestampS === timestampS,
          )?.value ?? 0,
        ).div(
          tokenOutHistoricalUsdPrices.find(
            (item) => item.timestampS === timestampS,
          )?.value ?? 1,
        ),
      }));
  })();
  const tokensRatio1DChange =
    tokensCurrentRatio !== undefined && tokensHistoricalRatios !== undefined
      ? new BigNumber(tokensCurrentRatio.minus(tokensHistoricalRatios[0].ratio))
          .div(tokensHistoricalRatios[0].ratio)
          .times(100)
      : undefined;

  const fetchTokenHistoricalUsdPrice = useCallback(
    async (token: VerifiedToken) => {
      try {
        const url = `https://public-api.birdeye.so/defi/history_price?address=${isSui(token.coin_type) ? SUI_COINTYPE : token.coin_type}&address_type=token&type=${HISTORICAL_PRICES_INTERVAL}&time_from=${Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60}&time_to=${Math.floor(new Date().getTime() / 1000)}`;
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

    fetchTokenHistoricalUsdPrice(tokenIn);
    fetchTokenHistoricalUsdPrice(tokenOut);
    fetchedInitialTokenHistoricalUsdPricesRef.current = true;
  }, [fetchTokenHistoricalUsdPrice, tokenIn, tokenOut]);

  // Price impact
  const priceImpactPercent =
    quoteRatio !== undefined && tokensCurrentRatio !== undefined
      ? new BigNumber(100).minus(quoteRatio.div(tokensCurrentRatio).times(100))
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
        fetchTokenHistoricalUsdPrice(_token);
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
        gas_budget: 0.25 * 10 ** 9, // Set to 0.25 SUI
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
      transaction.setGasBudget(SUI_GAS_MIN * 10 ** 9);

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

      const balanceChangeOut = res.balanceChanges?.find(
        (bc) => normalizeStructTag(bc.coinType) === tokenOut.coin_type,
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
            balanceChangeOut !== undefined
              ? new BigNumber(balanceChangeOut.amount).div(
                  10 ** tokenOut.decimals,
                )
              : quoteAmountOut,
            { dp: tokenOut.decimals, trimTrailingZeros: true },
          ),
          [
            tokenOut.ticker,
            deposit ? `, and deposited the ${tokenOut.ticker}` : "",
          ]
            .filter(Boolean)
            .join(""),
        ].join(" "),
        {
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
            <div className="mb-4 flex w-full flex-col gap-2 rounded-md bg-border/50 p-3">
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
                {quoteAmountIn && quoteAmountOut ? (
                  <div
                    className="group flex w-max cursor-pointer flex-row items-center gap-2"
                    onClick={() => setIsQuoteRatioInverted((is) => !is)}
                  >
                    <TLabel className="transition-colors group-hover:text-foreground">
                      {"1 "}
                      {(!isQuoteRatioInverted ? tokenIn : tokenOut).ticker}{" "}
                      <span className="font-sans">≈</span>{" "}
                      {formatToken(
                        (!isQuoteRatioInverted
                          ? quoteAmountOut
                          : quoteAmountIn
                        ).div(
                          !isQuoteRatioInverted
                            ? quoteAmountIn
                            : quoteAmountOut,
                        ),
                        {
                          dp: (!isQuoteRatioInverted ? tokenOut : tokenIn)
                            .decimals,
                        },
                      )}{" "}
                      {(!isQuoteRatioInverted ? tokenOut : tokenIn).ticker}
                    </TLabel>
                    <ArrowRightLeft className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-40" />
                )}
              </div>
            </div>
          )}

          {/* Swap */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-col gap-[1px] rounded-sm">
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
          <div className="mt-6 flex w-full flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-row items-center gap-2">
                <TokenLogos
                  className="h-4 w-4"
                  tokens={[tokenIn, tokenOut].map((t) => ({
                    coinType: t.coin_type,
                    symbol: t.ticker,
                    iconUrl: t.icon_url,
                  }))}
                />

                <TBody>
                  {tokenIn.ticker}
                  <span className="font-sans">/</span>
                  {tokenOut.ticker}
                </TBody>
              </div>

              {tokensCurrentRatio !== undefined &&
              tokensCurrentRatioDp !== undefined &&
              tokensRatio1DChange !== undefined ? (
                <TBody className="text-xs">
                  {formatToken(tokensCurrentRatio, {
                    dp: tokensCurrentRatioDp,
                    exact: true,
                  })}{" "}
                  <span
                    className={cn(
                      tokensRatio1DChange.gt(0) && "text-success",
                      tokensRatio1DChange.eq(0) && "text-muted-foreground",
                      tokensRatio1DChange.lt(0) && "text-destructive",
                    )}
                  >
                    {tokensRatio1DChange.gt(0) && "+"}
                    {tokensRatio1DChange.lt(0) && "-"}
                    {formatPercent(tokensRatio1DChange.abs())}
                  </span>
                </TBody>
              ) : (
                <Skeleton className="h-4 w-40" />
              )}
            </div>

            <div className="h-6 max-w-48 flex-1">
              {tokensHistoricalRatios !== undefined && (
                <TokensRatioChart data={tokensHistoricalRatios} />
              )}
            </div>
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
