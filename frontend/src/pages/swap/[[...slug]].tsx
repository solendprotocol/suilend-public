import Head from "next/head";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  GetQuoteResponse,
  HopApi,
  HopApiOptions,
  VerifiedToken,
} from "@hop.ag/sdk";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";
import { ArrowRightLeft, ArrowUpDown, RotateCw } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

import Button from "@/components/shared/Button";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import SwapInput from "@/components/swap/SwapInput";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import {
  COINTYPE_LOGO_MAP,
  COINTYPE_SYMBOL_MAP,
  SUI_COINTYPE,
  isSui,
} from "@/lib/coinType";
import { TX_TOAST_DURATION } from "@/lib/constants";
import { formatToken } from "@/lib/format";
import { SWAP_URL } from "@/lib/navigation";
import { cn, hoverUnderlineClassName } from "@/lib/utils";

type SubmitButtonState = {
  isLoading?: boolean;
  isDisabled?: boolean;
  title?: string;
  description?: string;
};

interface PageProps {
  sdk: HopApi;
  tokens: VerifiedToken[];
  tokenIn: VerifiedToken;
  tokenOut: VerifiedToken;
  setTokenInSymbol: (symbol: string) => void;
  setTokenOutSymbol: (symbol: string) => void;
  reverseTokenSymbols: () => void;
}

function Page({
  sdk,
  tokens,
  tokenIn,
  tokenOut,
  setTokenInSymbol,
  setTokenOutSymbol,
  reverseTokenSymbols,
}: PageProps) {
  const { address } = useWalletContext();
  const {
    refreshData,

    explorer,
    signExecuteAndWaitTransactionBlock,
    ...restAppContext
  } = useAppContext();
  const data = restAppContext.data as AppData;

  // Balances
  const tokenInBalance =
    data.coinBalancesMap[tokenIn.coin_type]?.balance ?? new BigNumber(0);
  const tokenOutBalance =
    data.coinBalancesMap[tokenOut.coin_type]?.balance ?? new BigNumber(0);

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

  // Usd prices
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
      ? new BigNumber(new BigNumber(tokenInUsdValue).minus(tokenOutUsdValue))
          .div(tokenInUsdValue)
          .times(100)
      : undefined;

  const fetchTokenUsdPrice = useCallback(async (token: VerifiedToken) => {
    try {
      const url = "https://public-api.birdeye.so/defi/price";
      const res = await fetch(
        `${url}?address=${isSui(token.coin_type) ? SUI_COINTYPE : token.coin_type}`,
        {
          headers: {
            "X-API-KEY": process.env.NEXT_PUBLIC_BIRDEYE_API_KEY as string,
            "x-chain": "sui",
          },
        },
      );
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

  const getExchangeRateLabel = () => {
    if (quoteAmountIn === undefined || quoteAmountOut === undefined) return;

    const inTicker =
      exchangeRateDirection === ExchangeRateDirection.FORWARD
        ? tokenIn.ticker
        : tokenOut.ticker;
    const outTicker =
      exchangeRateDirection === ExchangeRateDirection.FORWARD
        ? tokenOut.ticker
        : tokenIn.ticker;
    const exchangeRate =
      exchangeRateDirection === ExchangeRateDirection.FORWARD
        ? quoteAmountOut.div(quoteAmountIn)
        : quoteAmountIn.div(quoteAmountOut);
    const decimals =
      exchangeRateDirection === ExchangeRateDirection.FORWARD
        ? tokenOut.decimals
        : tokenIn.decimals;

    return [
      `1 ${inTicker}`,
      "≈",
      `${formatToken(exchangeRate, { dp: decimals })} ${outTicker}`,
    ].join(" ");
  };
  const exchangeRateLabel = getExchangeRateLabel();

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

  const actionInWords = [
    `${value} ${tokenIn.ticker}`,
    "for",
    `${quoteAmountOut !== undefined ? quoteAmountOut.toString() : "--"} ${tokenOut.ticker}`,
  ].join(" ");

  const onSubmitClick = async () => {
    if (submitButtonState.isDisabled) return;
    if (!address || !quote) return;

    setIsSubmitting(true);
    try {
      const tx = await sdk.fetchTx({
        trade: quote.trade,
        sui_address: address,

        max_slippage_bps: 100, // optional default is 1%
      });

      const txb = new TransactionBlock(
        tx.transaction as unknown as TransactionBlock,
      );
      const res = await signExecuteAndWaitTransactionBlock(txb);
      const txUrl = explorer.buildTxUrl(res.digest);

      toast.success(`Swapped ${actionInWords}`, {
        action: <TextLink href={txUrl}>View tx on {explorer.name}</TextLink>,
        duration: TX_TOAST_DURATION,
      });
      formatAndSetValue("", tokenIn);
    } catch (err) {
      toast.error(`Failed to swap ${actionInWords}`, {
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
        <div className="relative flex flex-col">
          {/* Settings */}
          <div className="mb-4 flex flex-row items-center gap-2">
            <div className="flex flex-row justify-center">
              <Button
                className="h-7 w-7 rounded-full px-0"
                tooltip="Refresh"
                icon={<RotateCw className="h-3 w-3" />}
                variant="secondary"
                onClick={fetchQuoteWrapper}
              >
                Refresh
              </Button>
            </div>
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
                token={tokenIn}
                usdValue={tokenInUsdValue}
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
          <div className="relative z-[2] -my-3.5 w-max self-center rounded-full bg-background">
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
          <div className="relative z-[1] mb-6 flex flex-col">
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
                token={tokenOut}
                usdValue={tokenOutUsdValue}
                usdValueChangePercent={tokenOutUsdValueChangePercent}
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

          {/* Submit */}
          <Button
            className="h-auto min-h-12 flex-1 rounded-md py-1 md:py-2"
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
          <div className="h-4">
            {exchangeRateLabel && (
              <Button
                className="mt-3 h-auto w-max px-0 py-0 text-muted-foreground hover:bg-transparent"
                labelClassName="text-xs font-sans"
                variant="ghost"
                endIcon={<ArrowRightLeft />}
                onClick={reverseExchangeRate}
              >
                {exchangeRateLabel}
              </Button>
            )}
          </div>
        </div>

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
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string[] | undefined;

  const { rpc, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // SDK
  const sdk = useMemo(() => {
    const hop_api_options: HopApiOptions = {
      api_key: process.env.NEXT_PUBLIC_HOP_AG_API_KEY as string,
      fee_bps: 0,
    };

    return new HopApi(rpc.url, hop_api_options);
  }, [rpc.url]);

  // State
  const tokenInSymbol = slug?.[0];
  const tokenOutSymbol = slug?.[1];

  const setTokenSymbol = useCallback(
    (newTokenSymbol: string, direction: "in" | "out") => {
      router.push(
        {
          pathname: [
            SWAP_URL,
            direction === "in" ? newTokenSymbol : tokenInSymbol,
            direction === "in" ? tokenOutSymbol : newTokenSymbol,
          ].join("/"),
        },
        undefined,
        { shallow: true },
      );
    },
    [router, tokenInSymbol, tokenOutSymbol],
  );

  const reverseTokenSymbols = useCallback(() => {
    router.push(
      { pathname: [SWAP_URL, tokenOutSymbol, tokenInSymbol].join("/") },
      undefined,
      { shallow: true },
    );
  }, [router, tokenInSymbol, tokenOutSymbol]);

  // Verified tokens
  const [verifiedTokens, setVerifiedTokens] = useState<
    VerifiedToken[] | undefined
  >(undefined);

  const isFetchingVerifiedTokensRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingVerifiedTokensRef.current) return;

      isFetchingVerifiedTokensRef.current = true;
      try {
        const result = await sdk.fetchTokens();
        setVerifiedTokens(
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

  const tokenIn = useMemo(
    () => verifiedTokens?.find((vt) => vt.ticker === tokenInSymbol),
    [verifiedTokens, tokenInSymbol],
  );
  const tokenOut = useMemo(
    () => verifiedTokens?.find((vt) => vt.ticker === tokenOutSymbol),
    [verifiedTokens, tokenOutSymbol],
  );

  useEffect(() => {
    if (
      slug === undefined ||
      slug.length !== 2 ||
      slug[0] === slug[1] ||
      (verifiedTokens && (!tokenIn || !tokenOut))
    )
      router.replace(
        { pathname: [SWAP_URL, "SUI", "USDC"].join("/") },
        undefined,
        { shallow: true },
      );
  }, [slug, verifiedTokens, tokenIn, tokenOut, router]);

  if (!verifiedTokens || !tokenIn || !tokenOut) return <FullPageSpinner />;
  return (
    <Page
      sdk={sdk}
      tokens={verifiedTokens}
      tokenIn={tokenIn}
      tokenOut={tokenOut}
      setTokenInSymbol={(symbol: string) => setTokenSymbol(symbol, "in")}
      setTokenOutSymbol={(symbol: string) => setTokenSymbol(symbol, "out")}
      reverseTokenSymbols={reverseTokenSymbols}
    />
  );
}
