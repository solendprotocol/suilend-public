import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";

import { GetQuoteResponse, HopApi, VerifiedToken } from "@hop.ag/sdk";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";
import { ArrowRightLeft, ArrowUpDown, RotateCw } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { useLocalStorage } from "usehooks-ts";

import Button from "@/components/shared/Button";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import RoutingDialog from "@/components/swap/RoutingDialog";
import SwapInput from "@/components/swap/SwapInput";
import SwapSlippagePopover from "@/components/swap/SwapSlippagePopover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/contexts/AppContext";
import { SwapContextProvider, useSwapContext } from "@/contexts/SwapContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { ParsedCoinBalance } from "@/lib/coinBalance";
import { SUI_COINTYPE, isSui } from "@/lib/coinType";
import { TX_TOAST_DURATION } from "@/lib/constants";
import { formatId, formatPercent, formatToken, formatUsd } from "@/lib/format";
import { cn, hoverUnderlineClassName } from "@/lib/utils";

enum TokenDirection {
  IN = "in",
  OUT = "out",
}

type SubmitButtonState = {
  isLoading?: boolean;
  isDisabled?: boolean;
  title?: string;
  description?: string;
};

function Page() {
  const { address } = useWalletContext();
  const { refreshData, explorer, signExecuteAndWaitTransactionBlock } =
    useAppContext();

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
        reason: "0.01 SUI should be saved for gas",
        isDisabled: true,
        value: tokenInBalance.minus(0.01),
      });

    return result;
  })();

  const tokenInMaxAmount = BigNumber.max(
    new BigNumber(0),
    BigNumber.min(
      ...Object.values(tokenInMaxCalculations).map((calc) => calc.value),
    ),
  ).toFixed(tokenIn.decimals, BigNumber.ROUND_DOWN);

  // State
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>("");

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

  // Quote
  const [quoteMap, setQuoteMap] = useState<
    Record<number, GetQuoteResponse | undefined>
  >({});
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

        setQuoteMap((o) => ({ ...o, [timestamp]: result }));
        return result;
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

  useSWR<GetQuoteResponse | undefined>("quote", fetchQuoteWrapper, {
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

  // USD prices
  const [usdPriceMap, setUsdPriceMap] = useState<Record<string, number>>({});
  const tokenInUsdPrice = usdPriceMap[tokenIn.coin_type];
  const tokenOutUsdPrice = usdPriceMap[tokenOut.coin_type];

  const tokenInUsdValue =
    quoteAmountIn !== undefined && tokenInUsdPrice !== undefined
      ? quoteAmountIn.times(tokenInUsdPrice)
      : undefined;
  const tokenOutUsdValue =
    quoteAmountOut !== undefined && tokenOutUsdPrice !== undefined
      ? quoteAmountOut.times(tokenOutUsdPrice)
      : undefined;
  const tokenOutUsdValueChangePercent =
    tokenInUsdValue !== undefined &&
    tokenOutUsdValue !== undefined &&
    quoteAmountIn !== undefined &&
    quoteAmountIn.gt(0)
      ? new BigNumber(new BigNumber(tokenOutUsdValue).minus(tokenInUsdValue))
          .div(tokenInUsdValue)
          .times(100)
      : undefined;

  const fetchTokenUsdPrice = useCallback(async (token: VerifiedToken) => {
    try {
      const url = `https://public-api.birdeye.so/defi/price?address=${isSui(token.coin_type) ? SUI_COINTYPE : token.coin_type}`;
      const res = await fetch(url, {
        headers: {
          "X-API-KEY": process.env.NEXT_PUBLIC_BIRDEYE_API_KEY as string,
          "x-chain": "sui",
        },
      });
      const json = await res.json();
      if (json.data?.value)
        setUsdPriceMap((o) => ({ ...o, [token.coin_type]: json.data.value }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const usdPricesIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  useEffect(() => {
    fetchTokenUsdPrice(tokenIn);
    fetchTokenUsdPrice(tokenOut);

    if (usdPricesIntervalRef.current !== undefined)
      clearInterval(usdPricesIntervalRef.current);
    usdPricesIntervalRef.current = setInterval(() => {
      fetchTokenUsdPrice(tokenIn);
      fetchTokenUsdPrice(tokenOut);
    }, 30 * 1000);

    return () => {
      if (usdPricesIntervalRef.current !== undefined)
        clearInterval(usdPricesIntervalRef.current);
    };
  }, [tokenIn, tokenOut, fetchTokenUsdPrice]);

  // Historical USD prices
  const [historicalUsdPriceMap, setHistoricalUsdPriceMap] = useState<
    Record<string, number>
  >({});

  const getTokenUsdPrice1DChange = (t: VerifiedToken) =>
    usdPriceMap[t.coin_type] !== undefined &&
    historicalUsdPriceMap[t.coin_type] !== undefined
      ? new BigNumber(
          ((usdPriceMap[t.coin_type] - historicalUsdPriceMap[t.coin_type]) /
            historicalUsdPriceMap[t.coin_type]) *
            100,
        )
      : undefined;

  const fetchTokenHistoricalUsdPrice = useCallback(
    async (token: VerifiedToken) => {
      try {
        const url = `https://public-api.birdeye.so/defi/history_price?address=${isSui(token.coin_type) ? SUI_COINTYPE : token.coin_type}&address_type=token&type=15m&time_from=${Math.floor(new Date().getTime() / 1000) - 24 * 60 * 60}&time_to=${Math.floor(new Date().getTime() / 1000)}`;
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
            [token.coin_type]: json.data.items[0].value,
          }));
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTokenHistoricalUsdPrice(tokenIn);
    fetchTokenHistoricalUsdPrice(tokenOut);
  }, [tokenIn, tokenOut, fetchTokenHistoricalUsdPrice]);

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
    }

    inputRef.current?.focus();
  };

  // Exchange rate
  enum ExchangeRateDirection {
    FORWARD = "forward",
    REVERSE = "reverse",
  }

  const [exchangeRateDirection, setExchangeRateDirection] =
    useState<ExchangeRateDirection>(ExchangeRateDirection.FORWARD);
  const reverseExchangeRate = () =>
    setExchangeRateDirection((q) =>
      q === ExchangeRateDirection.FORWARD
        ? ExchangeRateDirection.REVERSE
        : ExchangeRateDirection.FORWARD,
    );

  const exchangeRateLabel = (() => {
    const inTicker =
      exchangeRateDirection === ExchangeRateDirection.FORWARD
        ? tokenIn.ticker
        : tokenOut.ticker;
    const outTicker =
      exchangeRateDirection === ExchangeRateDirection.FORWARD
        ? tokenOut.ticker
        : tokenIn.ticker;

    if (quoteAmountIn === undefined || quoteAmountOut === undefined)
      return `1 ${inTicker} ≈ -- ${outTicker}`;

    const exchangeRate =
      exchangeRateDirection === ExchangeRateDirection.FORWARD
        ? quoteAmountOut.div(quoteAmountIn)
        : quoteAmountIn.div(quoteAmountOut);
    const decimals =
      exchangeRateDirection === ExchangeRateDirection.FORWARD
        ? tokenOut.decimals
        : tokenIn.decimals;

    return `1 ${inTicker} ≈ ${formatToken(exchangeRate, { dp: decimals })} ${outTicker}`;
  })();

  // Submit
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitButtonState: SubmitButtonState = (() => {
    if (!address) return { isDisabled: true, title: "Connect wallet" };
    if (isSubmitting) return { isDisabled: true, isLoading: true };

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
      isDisabled: !quote,
    };
  })();

  const onSubmitClick = async () => {
    if (submitButtonState.isDisabled) return;
    if (!address || !quote || isFetchingQuote) return;

    setIsSubmitting(true);
    await fetchQuoteWrapper();

    try {
      const tx = await sdk.fetchTx({
        trade: quote.trade,
        sui_address: address,

        max_slippage_bps: +slippage * 100,
      });

      const txb = new TransactionBlock(
        tx.transaction as unknown as TransactionBlock,
      );
      const res = await signExecuteAndWaitTransactionBlock(txb);
      const txUrl = explorer.buildTxUrl(res.digest);

      toast.success(
        `Swapped ${value} ${tokenIn.ticker} for ${tokenOut.ticker}`,
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
    } catch (err) {
      toast.error("Failed to swap", {
        description: ((err as Error)?.message || err) as string,
        duration: TX_TOAST_DURATION,
      });
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
      await refreshData();
    }
  };

  return (
    <>
      <Head>
        <title>Suilend Swap</title>
      </Head>

      <div className="flex w-full max-w-[500px] flex-col items-center gap-8">
        <div className="relative flex w-full flex-col">
          {/* Settings */}
          <div className="mb-4 flex flex-row items-center justify-between gap-2">
            <Button
              className="h-7 w-7 rounded-full px-0"
              tooltip="Refresh"
              icon={<RotateCw className="h-3 w-3" />}
              variant="secondary"
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

            <div className="relative z-[1] -mt-2 flex w-full rounded-b-md bg-primary/25 px-3 pb-2 pt-4">
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
                usdValueChangePercent={tokenOutUsdValueChangePercent}
                tokens={tokens}
                token={tokenOut}
                onSelectToken={(t: VerifiedToken) =>
                  onTokenCoinTypeChange(t.coin_type, TokenDirection.OUT)
                }
              />
            </div>

            <div className="relative z-[1] -mt-2 flex w-full rounded-b-md bg-border px-3 pb-2 pt-4">
              <div className="flex flex-row items-center gap-2">
                <TLabelSans>Balance</TLabelSans>
                <TBody className="text-xs">
                  {formatToken(tokenOutBalance, { exact: false })}{" "}
                  {tokenOut.ticker}
                </TBody>
              </div>
            </div>
          </div>

          {new BigNumber(value || 0).gt(0) && (
            <div className="mb-4 w-full">
              {quote ? (
                <RoutingDialog quote={quote} />
              ) : (
                <Skeleton className="h-5 w-40" />
              )}
            </div>
          )}

          {/* Submit */}
          <Button
            className="h-auto min-h-14 flex-1 rounded-lg py-1 md:py-2"
            labelClassName="text-wrap uppercase"
            style={{ overflowWrap: "anywhere" }}
            disabled={submitButtonState.isDisabled}
            onClick={onSubmitClick}
          >
            {submitButtonState.isLoading ? (
              <Spinner size="md" />
            ) : (
              submitButtonState.title
            )}

            {submitButtonState.description && (
              <span className="block font-sans text-xs normal-case opacity-75">
                {submitButtonState.description}
              </span>
            )}
          </Button>

          {/* Exchange rate */}
          <Button
            className="mt-4 h-auto w-max px-0 py-0 text-muted-foreground hover:bg-transparent"
            labelClassName="text-xs font-sans"
            variant="ghost"
            endIcon={<ArrowRightLeft />}
            onClick={reverseExchangeRate}
          >
            {exchangeRateLabel}
          </Button>

          {/* Tokens */}
          <div className="mt-6 flex w-full flex-col gap-4">
            {[tokenIn, tokenOut].map((t) => {
              const usdPrice = usdPriceMap[t.coin_type];
              const usdPriceDp =
                Math.max(0, -Math.floor(Math.log10(usdPrice)) - 1) + 2;
              const usdPrice1DChange = getTokenUsdPrice1DChange(t);

              return (
                <div
                  key={t.coin_type}
                  className="flex w-full flex-row justify-between"
                >
                  <div className="flex w-full flex-row items-center gap-3">
                    <TokenLogo
                      showTooltip
                      coinType={t.coin_type}
                      symbol={t.ticker}
                      src={t.icon_url}
                    />

                    <div className="flex flex-col gap-1">
                      <TBody className="w-max">{t.ticker}</TBody>
                      <TLabelSans className="w-max">{t.name}</TLabelSans>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <TBody className="w-max">
                      {usdPrice !== undefined &&
                      usdPrice1DChange !== undefined ? (
                        <>
                          {formatUsd(new BigNumber(usdPrice), {
                            dp: usdPriceDp,
                            exact: true,
                          })}{" "}
                          <span
                            className={cn(
                              usdPrice1DChange.gt(0) && "text-success",
                              usdPrice1DChange.eq(0) && "text-muted-foreground",
                              usdPrice1DChange.lt(0) && "text-destructive",
                            )}
                          >
                            {usdPrice1DChange.gt(0) && "+"}
                            {usdPrice1DChange.lt(0) && "-"}
                            {formatPercent(usdPrice1DChange.abs())}
                          </span>
                        </>
                      ) : (
                        <Skeleton className="h-5 w-20" />
                      )}
                    </TBody>
                    <TextLink
                      className="block w-max text-xs text-muted-foreground no-underline hover:text-foreground"
                      href={explorer.buildCoinUrl(t.coin_type)}
                    >
                      {isSui(t.coin_type)
                        ? SUI_COINTYPE
                        : formatId(t.coin_type)}
                    </TextLink>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        <TLabelSans>
          Powered by{" "}
          <TextLink
            className="text-muted-foreground decoration-muted-foreground/50"
            href="https://hop.ag/"
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
