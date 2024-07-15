import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";

import { HopApi, VerifiedToken } from "@hop.ag/sdk";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { normalizeStructTag } from "@mysten/sui.js/utils";
import * as Sentry from "@sentry/nextjs";
import BigNumber from "bignumber.js";
import { ArrowUpDown, RotateCw } from "lucide-react";
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
import { TBody, TLabelSans } from "@/components/shared/Typography";
import RoutingDialog from "@/components/swap/RoutingDialog";
import SwapInput from "@/components/swap/SwapInput";
import SwapSlippagePopover from "@/components/swap/SwapSlippagePopover";
import TokensRatioChart from "@/components/swap/TokensRatioChart";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AppData, useAppContext } from "@/contexts/AppContext";
import {
  Quote,
  SwapContextProvider,
  useSwapContext,
} from "@/contexts/SwapContext";
import { useWalletContext } from "@/contexts/WalletContext";
import {
  getSubmitButtonNoValueState,
  getSubmitButtonState,
} from "@/lib/actions";
import { ParsedCoinBalance } from "@/lib/coinBalance";
import { SUI_COINTYPE, isSui } from "@/lib/coinType";
import { SUI_DEPOSIT_GAS_MIN, TX_TOAST_DURATION } from "@/lib/constants";
import { formatPercent, formatToken } from "@/lib/format";
import { getFilteredRewards, getTotalAprPercent } from "@/lib/liquidityMining";
import track from "@/lib/track";
import { Action } from "@/lib/types";
import { cn, hoverUnderlineClassName } from "@/lib/utils";

enum TokenDirection {
  IN = "in",
  OUT = "out",
}

type SubmitButtonState = {
  isLoading?: boolean;
  isDisabled?: boolean;
  title?: string;
};

function Page() {
  const { address } = useWalletContext();
  const {
    refreshData,
    explorer,
    obligation,
    signExecuteAndWaitTransactionBlock,
    ...restAppContext
  } = useAppContext();
  const data = restAppContext.data as AppData;
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;

  const { setTokenSymbol, reverseTokenSymbols, ...restSwapContext } =
    useSwapContext();
  const sdk = restSwapContext.sdk as HopApi;
  const tokens = restSwapContext.tokens as VerifiedToken[];
  const tokenIn = restSwapContext.tokenIn as VerifiedToken;
  const tokenOut = restSwapContext.tokenOut as VerifiedToken;
  const coinBalancesMap = restSwapContext.coinBalancesMap as Record<
    string,
    ParsedCoinBalance
  >;

  // Balances
  const tokenInBalance =
    coinBalancesMap[tokenIn.coin_type]?.balance ?? new BigNumber(0);
  const tokenOutBalance =
    coinBalancesMap[tokenOut.coin_type]?.balance ?? new BigNumber(0);

  // Positions
  const tokenOutDepositPosition = obligation?.deposits?.find(
    (d) => d.coinType === tokenOut.coin_type,
  );
  const tokenOutBorrowPosition = obligation?.borrows?.find(
    (b) => b.coinType === tokenOut.coin_type,
  );

  const tokenOutDepositPositionAmount =
    tokenOutDepositPosition?.depositedAmount ?? new BigNumber(0);
  const tokenOutBorrowPositionAmount =
    tokenOutBorrowPosition?.borrowedAmount ?? new BigNumber(0);

  const [
    isShowingTokenOutDepositPosition,
    setIsShowingTokenOutDepositPosition,
  ] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsShowingTokenOutDepositPosition((is) => !is);
    }, 3000 + 500);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

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
        reason: `${SUI_DEPOSIT_GAS_MIN} SUI should be saved for gas`,
        isDisabled: true,
        value: tokenInBalance.minus(SUI_DEPOSIT_GAS_MIN),
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
  const [slippage, setSlippage] = useLocalStorage<string>(
    "swapSlippage",
    "1.0",
  );

  const formatAndSetSlippage = useCallback(
    (_value: string) => {
      if (new BigNumber(_value || 0).lt(0)) setSlippage("0");
      else if (new BigNumber(_value).gt(100)) setSlippage("100");
      else {
        if (_value.includes(".")) {
          const [whole, decimals] = _value.split(".");
          setSlippage(
            `${whole}.${decimals.slice(0, Math.min(decimals.length, 1))}`,
          );
        } else setSlippage(_value);
      }
    },
    [setSlippage],
  );

  // State
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>("");

  // Quote
  const [quoteMap, setQuoteMap] = useState<Record<number, Quote | undefined>>(
    {},
  );
  const quote = (() => {
    const timestamps = Object.entries(quoteMap)
      .filter(
        ([timestamp, quote]) =>
          quote !== undefined &&
          quote.trade.amount_in.token === tokenIn.coin_type &&
          quote.trade.amount_out.token === tokenOut.coin_type,
      )
      .map(([timestamp]) => +timestamp);

    return timestamps.length === 0
      ? undefined
      : quoteMap[Math.max(...timestamps)];
  })();
  const quoteAmountIn = quote
    ? BigNumber(quote.trade.amount_in.amount.toString()).div(
        10 ** tokenIn.decimals,
      )
    : undefined;
  const quoteAmountOut = quote
    ? BigNumber(quote.trade.amount_out.amount.toString()).div(
        10 ** tokenOut.decimals,
      )
    : undefined;

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
            new BigNumber(_value).times(10 ** _tokenIn.decimals).toString(),
          ),
        };

        const result = await sdk.fetchQuote(params);
        result.trade.amount_in.token = normalizeStructTag(
          result.trade.amount_in.token,
        );
        result.trade.amount_out.token = normalizeStructTag(
          result.trade.amount_out.token,
        );
        for (const node of Object.values(result.trade.nodes)) {
          node.amount_in.token = normalizeStructTag(node.amount_in.token);
          node.amount_out.token = normalizeStructTag(node.amount_out.token);
        }

        const resultWithId = { ...result, id: uuidv4() };
        setQuoteMap((o) => ({ ...o, [timestamp]: resultWithId }));
        return resultWithId;
      } catch (err) {
        console.error(err);

        setQuoteMap((o) => {
          delete o[timestamp];
          return o;
        });
      }
    },
    [tokenIn, tokenOut, value, sdk],
  );
  const fetchQuoteWrapper = useCallback(() => fetchQuote(), [fetchQuote]);

  useSWR<Quote | undefined>("quote", fetchQuoteWrapper, {
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
      if (new BigNumber(_value || 0).lte(0)) {
        setQuoteMap({});
        setValue(_value);
      } else {
        if (_value.includes(".")) {
          const [whole, decimals] = _value.split(".");
          setValue(
            `${whole}.${decimals.slice(0, Math.min(decimals.length, token.decimals))}`,
          );
        } else setValue(_value);
      }
    },
    [],
  );

  const onValueChange = (_value: string) => {
    formatAndSetValue(_value, tokenIn);
    if (new BigNumber(_value || 0).gt(0)) fetchQuote(tokenIn, tokenOut, _value);
  };

  const useMaxValueWrapper = () => {
    formatAndSetValue(tokenInMaxAmount, tokenIn);
    if (new BigNumber(tokenInMaxAmount).gt(0))
      fetchQuote(tokenIn, tokenOut, tokenInMaxAmount);

    inputRef.current?.focus();
  };

  // Historical USD prices
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
      ? tokenInHistoricalUsdPrices[tokenInHistoricalUsdPrices.length - 1].value
      : undefined;
  const tokenOutCurrentUsdPrice =
    tokenOutHistoricalUsdPrices !== undefined
      ? tokenOutHistoricalUsdPrices[tokenOutHistoricalUsdPrices.length - 1]
          .value
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
      timestampsS.push(timestampsS[timestampsS.length - 1] + 60 * 1); // 1 minute
    }

    return timestampsS
      .filter((timestampS, index) => index % 10 === 0) // 1*10 = 10 minutes
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
        const url = `https://public-api.birdeye.so/defi/history_price?address=${isSui(token.coin_type) ? SUI_COINTYPE : token.coin_type}&address_type=token&type=1m&time_from=${Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60}&time_to=${Math.floor(new Date().getTime() / 1000)}`;
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

  // Reverse tokens
  const reverseTokens = () => {
    reverseTokenSymbols();

    const _value =
      new BigNumber(value || 0).gt(0) &&
      quoteAmountOut !== undefined &&
      quoteAmountOut.gt(0)
        ? quoteAmountOut.toString()
        : "";
    formatAndSetValue(_value, tokenOut);
    if (new BigNumber(_value || 0).gt(0)) fetchQuote(tokenOut, tokenIn, _value);

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
      setTokenSymbol(_token.ticker, direction);

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

    for (const calc of tokenInMaxCalculations) {
      if (new BigNumber(value).gt(calc.value))
        return { isDisabled: calc.isDisabled, title: calc.reason };
    }

    return {
      title: "Swap",
      isDisabled: !quote || isSwappingAndDepositing,
    };
  })();

  const swapAndDepositButtonState: SubmitButtonState = (() => {
    if (!hasTokenOutReserve)
      return { isDisabled: true, title: "Cannot deposit this token" };
    if (isSwappingAndDepositing) return { isDisabled: true, isLoading: true };

    return {
      title: `Swap and deposit for ${formatPercent(tokenOutReserveDepositAprPercent)} APR`,
      isDisabled: swapButtonState.isDisabled || isSwapping,
    };
  })();

  const swap = async (deposit?: boolean) => {
    if (!address) throw new Error("Wallet not connected");
    if (!quote) throw new Error("Quote not found");
    if (deposit && !hasTokenOutReserve)
      throw new Error("Cannot deposit this token");

    const isDepositing = !!(deposit && hasTokenOutReserve);

    let txb = new TransactionBlock();
    try {
      const tx = await sdk.fetchTx({
        trade: quote.trade,
        sui_address: address,

        gas_budget: 0.25 * 10 ** 9, // Set to 0.25 SUI
        max_slippage_bps: +slippage * 100,

        return_output_coin_argument: isDepositing,
      });

      txb = new TransactionBlock(tx.transaction as unknown as TransactionBlock);
      txb.setGasBudget("" as any); // Set to dynamic

      if (isDepositing) {
        if (!tx.output_coin) throw new Error("Missing coin to deposit");

        const obligationOwnerCap = data.obligationOwnerCaps?.find(
          (o) => o.obligationId === obligation?.id,
        );

        await suilendClient.depositCoin(
          address,
          tx.output_coin as any,
          tokenOutReserve.coinType,
          txb,
          obligationOwnerCap?.id,
        );
      }
    } catch (err) {
      Sentry.captureException(err);
      console.error(err);
      throw err;
    }

    const res = await signExecuteAndWaitTransactionBlock(txb);
    return res;
  };

  const onSwapClick = async (deposit?: boolean) => {
    if (deposit) {
      if (
        swapAndDepositButtonState.isDisabled ||
        swapAndDepositButtonDisabledTooltip !== undefined
      )
        return;
    } else {
      if (swapButtonState.isDisabled) return;
    }
    if (
      quoteAmountOut === undefined ||
      // tokenInUsdValue === undefined ||
      // tokenOutUsdValue === undefined ||
      isFetchingQuote
    )
      return;

    (deposit ? setIsSwappingAndDepositing : setIsSwapping)(true);

    try {
      const res = await swap(deposit);
      const txUrl = explorer.buildTxUrl(res.digest);

      toast.success(
        `Swapped ${value} ${tokenIn.ticker} for ${tokenOut.ticker}${deposit ? ` and deposited the ${tokenOut.ticker}` : ""}`,
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
        amountOut: quoteAmountOut.toString(),
        deposit: deposit ? "true" : "false",
      };
      if (tokenInUsdValue !== undefined)
        properties.amountInUsd = tokenInUsdValue.toString();
      if (tokenOutUsdValue !== undefined)
        properties.amountOutUsd = tokenOutUsdValue.toString();

      track("swap_success", properties);
    } catch (err) {
      toast.error("Failed to swap", {
        description: ((err as Error)?.message || err) as string,
        duration: TX_TOAST_DURATION,
      });
    } finally {
      (deposit ? setIsSwappingAndDepositing : setIsSwapping)(false);
      inputRef.current?.focus();
      await refreshData();
    }
  };

  const swapAndDepositButtonDisabledTooltip = (() => {
    if (!hasTokenOutReserve || quoteAmountOut === undefined) return;

    const depositSubmitButtonNoValueState = getSubmitButtonNoValueState(
      Action.DEPOSIT,
      tokenOutReserve,
      data.obligations,
    )();
    const depositSubmitButtonState = getSubmitButtonState(
      Action.DEPOSIT,
      tokenOutReserve,
      quoteAmountOut.plus(
        isSui(tokenOutReserve.coinType) ? SUI_DEPOSIT_GAS_MIN : 0,
      ),
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
              slippage={slippage}
              onSlippageChange={formatAndSetSlippage}
            />
          </div>

          {/* In */}
          <div className="relative z-[1] flex flex-col">
            <div className="relative z-[2] w-full">
              <SwapInput
                ref={inputRef}
                title="You're paying"
                autoFocus
                value={value}
                onChange={onValueChange}
                usdValue={tokenInUsdValue}
                tokens={tokens}
                token={tokenIn}
                onSelectToken={(t: VerifiedToken) =>
                  onTokenCoinTypeChange(t.coin_type, TokenDirection.IN)
                }
              />
            </div>

            <div className="relative z-[1] -mt-2 flex w-full flex-row rounded-b-md bg-primary/25 px-3 pb-2 pt-4">
              <div
                className="flex cursor-pointer flex-row items-center gap-2"
                onClick={useMaxValueWrapper}
              >
                <TLabelSans>Balance</TLabelSans>
                <TBody
                  className={cn(
                    "text-xs",
                    cn("decoration-foreground/50", hoverUnderlineClassName),
                  )}
                >
                  {formatToken(tokenInBalance, { exact: false })}{" "}
                  {tokenIn.ticker}
                </TBody>
              </div>
            </div>
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
          <div className="relative z-[1] mb-4 flex flex-col">
            <div className="relative z-[2] w-full">
              <SwapInput
                title="To receive"
                value={
                  new BigNumber(value || 0).gt(0) &&
                  quoteAmountOut !== undefined
                    ? quoteAmountOut.toString()
                    : ""
                }
                isValueLoading={isFetchingQuote}
                usdValue={tokenOutUsdValue}
                tokens={tokens}
                token={tokenOut}
                onSelectToken={(t: VerifiedToken) =>
                  onTokenCoinTypeChange(t.coin_type, TokenDirection.OUT)
                }
              />
            </div>

            <div className="relative z-[1] -mt-2 flex w-full flex-row flex-wrap justify-between gap-x-2 gap-y-1 rounded-b-md bg-border px-3 pb-2 pt-4">
              <div className="flex flex-row items-center gap-2">
                <TLabelSans>Balance</TLabelSans>
                <TBody className="text-xs">
                  {formatToken(tokenOutBalance, { exact: false })}{" "}
                  {tokenOut.ticker}
                </TBody>
              </div>

              {hasTokenOutReserve && (
                <div className="flex w-max flex-row items-center justify-end">
                  <div className="flex h-4 flex-col items-end justify-center">
                    <div
                      className={cn(
                        "flex h-0 w-max flex-row items-center gap-2 opacity-0 transition-opacity duration-500",
                        isShowingTokenOutDepositPosition && "opacity-100",
                      )}
                    >
                      <TLabelSans>Deposited</TLabelSans>
                      <TBody className="text-xs">
                        {formatToken(tokenOutDepositPositionAmount, {
                          exact: false,
                        })}
                      </TBody>
                    </div>

                    <div
                      className={cn(
                        "flex h-0 w-max flex-row items-center gap-2 opacity-0 transition-opacity duration-500",
                        !isShowingTokenOutDepositPosition && "opacity-100",
                      )}
                    >
                      <TLabelSans>Borrowed</TLabelSans>
                      <TBody className="text-xs">
                        {formatToken(tokenOutBorrowPositionAmount, {
                          exact: false,
                        })}
                      </TBody>
                    </div>
                  </div>

                  <TBody
                    className="text-xs"
                    style={{ marginLeft: `${7.2 * 1}px` }}
                  >
                    {tokenOut.ticker}
                  </TBody>
                </div>
              )}
            </div>
          </div>

          {/* Routing */}
          {new BigNumber(value || 0).gt(0) && (
            <div className="mb-4 w-full">
              {quote ? (
                <ReactFlowProvider>
                  <RoutingDialog quote={quote} />
                </ReactFlowProvider>
              ) : (
                <Skeleton className="h-5 w-40" />
              )}
            </div>
          )}

          {/* Swap */}
          <div className="flex w-full flex-col gap-[1px]">
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
              <Button
                tooltip={
                  !swapAndDepositButtonState.isDisabled
                    ? swapAndDepositButtonDisabledTooltip
                    : undefined
                }
                className="rounded-t-none disabled:pointer-events-auto disabled:bg-secondary"
                labelClassName="uppercase text-xs"
                variant="secondary"
                disabled={
                  swapAndDepositButtonState.isDisabled ||
                  swapAndDepositButtonDisabledTooltip !== undefined
                }
                onClick={() => onSwapClick(true)}
              >
                {swapAndDepositButtonState.isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  swapAndDepositButtonState.title
                )}
              </Button>
            )}
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

        <Separator />

        <TLabelSans className="opacity-50">
          Powered by{" "}
          <TextLink
            className="text-muted-foreground decoration-muted-foreground/50"
            href="https://hop.ag/"
            noIcon
          >
            Hop
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
