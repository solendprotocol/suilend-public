import Head from "next/head";
import {
  Dispatch,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  GetQuoteResponse,
  HopApi,
  HopApiOptions,
  VerifiedToken,
} from "@hop.ag/sdk";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";
import { DebouncedFunc, debounce } from "lodash";
import { ArrowRightLeft, ArrowUpDown, RotateCw } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

import Button from "@/components/shared/Button";
import FullPageSpinner from "@/components/shared/FullPageSpinner";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import { TBody, TBodySans, TLabelSans } from "@/components/shared/Typography";
import SwapInput from "@/components/swap/SwapInput";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import {
  NORMALIZED_SUI_COINTYPE,
  NORMALIZED_USDC_ET_COINTYPE,
  isSui,
} from "@/lib/coinType";
import { TX_TOAST_DURATION } from "@/lib/constants";
import { formatToken } from "@/lib/format";
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
  setTokenInCoinType: Dispatch<React.SetStateAction<string>>;
  tokenIn: VerifiedToken;
  setTokenOutCoinType: Dispatch<React.SetStateAction<string>>;
  tokenOut: VerifiedToken;
}

function Page({
  sdk,
  tokens,
  setTokenInCoinType,
  tokenIn,
  setTokenOutCoinType,
  tokenOut,
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
  type MaxCalculation = {
    reason: string;
    isDisabled?: boolean;
    value: BigNumber;
  };

  const tokenInMaxCalculations: MaxCalculation[] = (() => {
    const result = [
      {
        reason: `Insufficient ${tokenIn.ticker} balance`,
        isDisabled: true,
        value: tokenInBalance,
      },
    ];
    if (isSui(tokenIn.coin_type))
      result.push({
        reason: `0.01 SUI should be saved for gas`,
        isDisabled: true,
        value: tokenInBalance.minus(0.01),
      });

    return result;
  })();

  const tokenInMaxAmount = (() => {
    return BigNumber.max(
      new BigNumber(0),
      BigNumber.min(
        ...Object.values(tokenInMaxCalculations).map((calc) => calc.value),
      ),
    ).toFixed(tokenIn.decimals, BigNumber.ROUND_DOWN);
  })();

  // Value
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>("");
  const amountIn = useMemo(() => new BigNumber(value || "0"), [value]);

  const maxAmount = tokenInMaxAmount;

  const formatAndSetValue = useCallback(
    (_value: string, token: VerifiedToken) => {
      if (_value.includes(".")) {
        const [whole, decimals] = _value.split(".");
        setValue(
          `${whole}.${decimals.slice(0, Math.min(decimals.length, token.decimals))}`,
        );
      } else setValue(_value);
    },
    [],
  );

  const onValueChange = (_value: string) => {
    formatAndSetValue(_value, tokenIn);
  };

  const useMaxValueWrapper = () => {
    formatAndSetValue(maxAmount, tokenIn);
    inputRef.current?.focus();
  };

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
  const isFetchingQuote = (() => {
    const timestamps = Object.keys(quoteMap).map((timestamp) => +timestamp);

    return timestamps.length === 0
      ? false
      : quoteMap[Math.max(...timestamps)] === undefined;
  })();

  const quoteFetcher = useCallback(async () => {
    if (tokenIn.coin_type === tokenOut.coin_type) return;
    if (amountIn.lte(0)) return;

    const timestamp = new Date().getTime();
    setQuoteMap((o) => ({ ...o, [timestamp]: undefined }));

    try {
      const params = {
        token_in: tokenIn.coin_type,
        token_out: tokenOut.coin_type,
        amount_in: BigInt(amountIn.times(10 ** tokenIn.decimals).toString()),
      };

      const result = await sdk.fetchQuote(params);
      result.trade.amount_in.token = normalizeStructTag(
        result.trade.amount_in.token,
      );
      result.trade.amount_out.token = normalizeStructTag(
        result.trade.amount_out.token,
      );

      console.log("XXX fetched quote:", result);
      setQuoteMap((o) => ({ ...o, [timestamp]: result }));
      return result;
    } catch (err) {
      console.error(err);

      setQuoteMap((o) => {
        delete o[timestamp];
        return o;
      });
    }
  }, [tokenIn, tokenOut, amountIn, sdk]);

  const { mutate: mutateQuote } = useSWR<GetQuoteResponse | undefined>(
    "quote",
    quoteFetcher,
    {
      refreshInterval: 30 * 1000,
      onSuccess: (data) => {
        console.log("Fetched quote", data);
      },
      onError: (err) => {
        console.error(err);
      },
    },
  );

  const fetchQuote = useCallback(async () => {
    await mutateQuote();
  }, [mutateQuote]);
  const debouncedFetchQuote = useRef<DebouncedFunc<typeof fetchQuote>>(
    debounce(fetchQuote, 50),
  ).current;

  useEffect(() => {
    debouncedFetchQuote();
  }, [tokenIn, tokenOut, amountIn, debouncedFetchQuote]);

  const amountOut = useMemo(
    () =>
      tokenOut && quote
        ? new BigNumber(quote.amount_out_with_fee.toString()).div(
            10 ** tokenOut.decimals,
          )
        : new BigNumber(0),
    [tokenOut, quote],
  );
  const actionInWords = `${value} ${tokenIn.ticker} for ${amountOut.toString()} ${tokenOut.ticker}`;

  // Reverse tokens
  const reverseTokens = () => {
    const tokenInCoinType = tokenIn.coin_type;
    const tokenOutCoinType = tokenOut.coin_type;

    setTokenInCoinType(tokenOutCoinType);
    setTokenOutCoinType(tokenInCoinType);
    formatAndSetValue(
      amountIn.lte(0) || amountOut.eq(0) ? "" : amountOut.toString(),
      tokenOut,
    );

    inputRef.current?.focus();
  };

  // Quote label
  const [quoteDirection, setQuoteDirection] = useState<"forward" | "reverse">(
    "forward",
  );
  const reverseQuote = () =>
    setQuoteDirection((q) => (q === "forward" ? "reverse" : "forward"));

  const getQuoteLabel = () => {
    if (!quote) return;

    const _tokenIn = quoteDirection === "forward" ? tokenIn : tokenOut;
    const _tokenOut = quoteDirection === "forward" ? tokenOut : tokenIn;
    const _amountIn =
      quoteDirection === "forward"
        ? new BigNumber(quote.trade.amount_in.amount.toString()).div(
            10 ** tokenIn.decimals,
          )
        : new BigNumber(quote.trade.amount_out.amount.toString()).div(
            10 ** tokenOut.decimals,
          );
    const _amountOut =
      quoteDirection === "forward"
        ? new BigNumber(quote.trade.amount_out.amount.toString()).div(
            10 ** tokenOut.decimals,
          )
        : new BigNumber(quote.trade.amount_in.amount.toString()).div(
            10 ** tokenIn.decimals,
          );

    return `1 ${_tokenIn.ticker} ≈ ${formatToken(_amountOut.div(_amountIn), {
      dp: _tokenOut.decimals,
    })} ${_tokenOut.ticker}`;
  };

  // Submit
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitButtonState: SubmitButtonState = (() => {
    if (!address) return { isDisabled: true, title: "Connect wallet" };
    if (isSubmitting) return { isDisabled: true, isLoading: true };

    if (value === "") return { isDisabled: true, title: "Enter a value" };
    if (new BigNumber(value).lt(0))
      return { isDisabled: true, title: "Enter a +ve value" };
    if (new BigNumber(value).eq(0))
      return { isDisabled: true, title: "Enter a non-zero value" };

    for (const calc of tokenInMaxCalculations) {
      if (new BigNumber(value).gt(calc.value))
        return { isDisabled: calc.isDisabled, title: calc.reason };
    }

    if (!quote) return { isDisabled: true, isLoading: true };

    return {
      title: "Swap",
      isDisabled: isFetchingQuote,
    };
  })();

  const onSubmitClick = async () => {
    if (submitButtonState.isDisabled) return;
    if (!address || !quote) return;

    setIsSubmitting(true);

    console.log(
      "XXX submitting:",
      tokenIn,
      tokenOut,
      amountIn.toString(),
      amountOut,
    );

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
      setValue("");
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
        <div className="flex flex-col gap-4">
          {/* Settings */}
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-row justify-center">
              <Button
                className="h-7 w-7 rounded-full px-0"
                tooltip="Refresh"
                icon={<RotateCw className="h-3 w-3" />}
                variant="secondary"
                onClick={fetchQuote}
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border p-4">
            {/* In */}
            <div className="flex flex-col gap-2">
              <TBodySans>{"You're paying"}</TBodySans>

              <div className="relative flex flex-col">
                <div className="relative z-[2] w-full">
                  <SwapInput
                    ref={inputRef}
                    autoFocus
                    value={value}
                    onChange={onValueChange}
                    token={tokenIn}
                  />
                </div>

                <div className="relative z-[1] -mt-2 flex w-full justify-end rounded-b-md bg-primary/25 px-2 pb-2 pt-4">
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
            </div>

            {/* Reverse */}
            <div className="relative -mb-1 flex flex-row justify-center">
              <div className="relative z-[2] bg-background">
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

              <Separator className="absolute left-0 right-0 top-1/2 z-[1] -translate-y-2/4" />
            </div>

            {/* Out */}
            <div className="flex flex-col gap-2">
              <TBodySans>To receive</TBodySans>

              <div className="relative flex flex-col">
                <div className="relative z-[2] w-full">
                  <SwapInput
                    value={amountIn.gt(0) ? amountOut.toString() : ""}
                    isValueLoading={isFetchingQuote}
                    token={tokenOut}
                  />
                </div>

                <div className="relative z-[1] -mt-2 flex w-full justify-end rounded-b-md bg-border px-2 pb-2 pt-4">
                  <div className="flex flex-row items-center gap-2">
                    <TLabelSans>Balance</TLabelSans>
                    <TBody className="text-xs">
                      {formatToken(tokenOutBalance, { exact: false })}{" "}
                      {tokenOut.ticker}
                    </TBody>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="mt-2 h-auto min-h-12 flex-1 rounded-md py-1 md:min-h-14 md:py-2"
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
          </div>

          {/* Quote */}
          {quote && (
            <Button
              className="h-auto w-max px-0 py-0 text-muted-foreground hover:bg-transparent"
              labelClassName="text-xs font-sans"
              variant="ghost"
              endIcon={<ArrowRightLeft />}
              onClick={reverseQuote}
            >
              {getQuoteLabel()}
            </Button>
          )}
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
            const coinMetadata = data.coinMetadataMap[coinType];

            return {
              ...token,
              coin_type: coinType,
              ticker: coinMetadata?.symbol ?? token.ticker,
              icon_url: coinMetadata?.iconUrl ?? token.icon_url,
            };
          }),
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, [sdk, data.coinMetadataMap]);

  // State
  const [tokenInCoinType, setTokenInCoinType] = useState<string>(
    NORMALIZED_SUI_COINTYPE,
  );
  const tokenIn = verifiedTokens?.find(
    (vt) => vt.coin_type === tokenInCoinType,
  );

  const [tokenOutCoinType, setTokenOutCoinType] = useState<string>(
    NORMALIZED_USDC_ET_COINTYPE,
  );
  const tokenOut = verifiedTokens?.find(
    (vt) => vt.coin_type === tokenOutCoinType,
  );

  if (!verifiedTokens || !tokenIn || !tokenOut) return <FullPageSpinner />;
  return (
    <Page
      sdk={sdk}
      tokens={verifiedTokens}
      setTokenInCoinType={setTokenInCoinType}
      tokenIn={tokenIn}
      setTokenOutCoinType={setTokenOutCoinType}
      tokenOut={tokenOut}
    />
  );
}
