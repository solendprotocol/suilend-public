import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

import { GetQuoteResponse, VerifiedToken } from "@hop.ag/sdk";
import { CoinMetadata, SuiClient } from "@mysten/sui.js/client";
import BigNumber from "bignumber.js";
import { Route } from "lucide-react";

import Dialog from "@/components/dashboard/Dialog";
import Button from "@/components/shared/Button";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import TokenLogo from "@/components/shared/TokenLogo";
import TokenLogos from "@/components/shared/TokenLogos";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { EXCHANGE_NAME_MAP, useSwapContext } from "@/contexts/SwapContext";
import { getCoinMetadataMap } from "@/lib/coinMetadata";
import { formatId, formatList } from "@/lib/format";

interface TokenAmountProps {
  token: VerifiedToken;
  amount: BigNumber;
}

function TokenAmount({ token, amount }: TokenAmountProps) {
  return (
    <div className="flex flex-row items-center gap-1.5">
      <TokenLogo
        className="h-4 w-4"
        imageProps={{ className: "rounded-full" }}
        token={{
          coinType: token.coin_type,
          symbol: token.ticker,
          iconUrl: token.icon_url,
        }}
      />
      <TBody>
        {+amount} {token.ticker}
      </TBody>
    </div>
  );
}

const useGetCoinMetadataMap = (coinTypes: string[]) => {
  const appContext = useAppContext();
  const suiClient = appContext.suiClient as SuiClient;

  const fetchingCoinTypesRef = useRef<string[]>([]);
  const [coinMetadataMap, setCoinMetadataMap] = useState<
    Record<string, CoinMetadata>
  >({});
  useEffect(() => {
    (async () => {
      const filteredCoinTypes = coinTypes.filter(
        (coinType) =>
          !coinMetadataMap[coinType] &&
          !fetchingCoinTypesRef.current.includes(coinType),
      );
      if (filteredCoinTypes.length === 0) return;

      fetchingCoinTypesRef.current.push(...filteredCoinTypes);

      const result = await getCoinMetadataMap(suiClient, coinTypes);
      setCoinMetadataMap(result);
      fetchingCoinTypesRef.current = fetchingCoinTypesRef.current.filter(
        (coinType) => !filteredCoinTypes.includes(coinType),
      );
    })();
  }, [coinTypes, coinMetadataMap, suiClient]);

  return coinMetadataMap;
};

interface RoutingDialogProps {
  quote: GetQuoteResponse;
}

export default function RoutingDialog({ quote }: RoutingDialogProps) {
  const { explorer } = useAppContext();

  const swapContext = useSwapContext();
  const tokens = swapContext.tokens as VerifiedToken[];
  const tokenIn = swapContext.tokenIn as VerifiedToken;
  const tokenOut = swapContext.tokenOut as VerifiedToken;

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onOpenChange = (_isOpen: boolean) => {
    setIsOpen(_isOpen);
  };

  // Quote
  const quoteAmountIn = BigNumber(quote.trade.amount_in.amount.toString()).div(
    10 ** tokenIn.decimals,
  );
  const quoteAmountOut = BigNumber(
    quote.trade.amount_out.amount.toString(),
  ).div(10 ** tokenOut.decimals);

  // Coin metadata
  const nodeTokenCoinTypes = useMemo(() => {
    const coinTypes: string[] = [];
    for (const node of Object.values(quote.trade.nodes)) {
      for (const coinType of [node.amount_in.token, node.amount_out.token]) {
        if (!coinTypes.includes(coinType)) coinTypes.push(coinType);
      }
    }

    return coinTypes;
  }, [quote]);

  const coinMetadataMap = useGetCoinMetadataMap(nodeTokenCoinTypes);

  // Hops
  const hopsCount = Object.keys(quote.trade.nodes).length;
  const nodes = Object.values(quote.trade.nodes);

  // const chainedNodeObjectIds: string[][] = [];
  // Object.entries(quote.trade.edges).forEach(
  //   ([endNodeObjectId, nodeObjectIds]) => {
  //     chainedNodeObjectIds.push([...nodeObjectIds, endNodeObjectId]);
  //   },
  // );
  // chainedNodeObjectIds.push(
  //   ...Object.keys(quote.trade.nodes)
  //     .filter(
  //       (nodeObjectId) => !chainedNodeObjectIds.flat().includes(nodeObjectId),
  //     )
  //     .map((nodeObjectId) => [nodeObjectId]),
  // );

  // const chainedNodes = chainedNodeObjectIds.map(
  //   (nodeObjectIds) =>
  //     nodeObjectIds
  //       .map((nodeObjectId) =>
  //         nodes.find((node) => node.pool.object_id === nodeObjectId),
  //       )
  //       .filter(Boolean) as typeof nodes,
  // );

  type Node = GetQuoteResponse["trade"]["nodes"][0];
  type NodeWithTokens = Node & {
    amount_in: Node["amount_in"] & VerifiedToken;
    amount_out: Node["amount_out"] & VerifiedToken;
  };

  const nodesWithTokens = nodes
    .map((node) => {
      const inToken = tokens.find((t) => t.coin_type === node.amount_in.token);
      const outToken = tokens.find(
        (t) => t.coin_type === node.amount_out.token,
      );

      const inCoinMetadata = coinMetadataMap[node.amount_in.token];
      const outCoinMetadata = coinMetadataMap[node.amount_out.token];

      if (!(inToken || inCoinMetadata) || !(outToken || outCoinMetadata))
        return undefined;
      return {
        ...node,
        amount_in: {
          ...node.amount_in,
          ...({
            coin_type: node.amount_in.token,
            name: inToken?.name ?? inCoinMetadata?.name,
            ticker: inToken?.ticker ?? inCoinMetadata?.symbol,
            icon_url: inToken?.icon_url ?? inCoinMetadata?.iconUrl,
            decimals: inToken?.decimals ?? inCoinMetadata?.decimals,
          } as VerifiedToken),
        },
        amount_out: {
          ...node.amount_out,
          ...({
            coin_type: node.amount_out.token,
            name: outToken?.name ?? outCoinMetadata?.name,
            ticker: outToken?.ticker ?? outCoinMetadata?.symbol,
            icon_url: outToken?.icon_url ?? outCoinMetadata?.iconUrl,
            decimals: outToken?.decimals ?? outCoinMetadata?.decimals,
          } as VerifiedToken),
        },
      };
    })
    .filter(Boolean) as NodeWithTokens[];

  const isLoading = nodesWithTokens.length !== nodes.length;

  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      trigger={
        <div className="flex h-5 w-max max-w-full cursor-pointer flex-row items-center gap-2">
          <Button
            className="rounded-full"
            labelClassName="font-sans text-xs"
            startIcon={<Route />}
            variant="secondaryOutline"
            size="sm"
          >
            {hopsCount} hop{hopsCount !== 1 && "s"}
          </Button>
          <TLabelSans className="flex-1 overflow-hidden text-ellipsis text-nowrap">
            {"via "}
            {formatList(
              Array.from(
                new Set(
                  Object.values(quote.trade.nodes).map(
                    (node) =>
                      EXCHANGE_NAME_MAP[node.pool.sui_exchange] ??
                      node.pool.sui_exchange,
                  ),
                ),
              ),
            )}
          </TLabelSans>
        </div>
      }
      contentProps={{
        className:
          "max-w-xl max-h-[calc(100dvh-var(--sm-my)*2)] h-auto overflow-auto",
      }}
      titleIcon={<Route />}
      title="Routing"
    >
      <div className="w-full overflow-auto p-4 pt-0">
        {isLoading ? (
          <Spinner size="md" />
        ) : (
          <div className="flex w-full min-w-max flex-col items-center gap-4">
            <div className="rounded-md bg-muted/10 px-3 py-2">
              <TokenAmount token={tokenIn} amount={quoteAmountIn} />
            </div>

            {nodesWithTokens.flat().map((node) => {
              const amountIn = BigNumber(node.amount_in.amount.toString()).div(
                10 ** node.amount_in.decimals,
              );
              const amountOut = BigNumber(
                node.amount_out.amount.toString(),
              ).div(10 ** node.amount_out.decimals);

              return (
                <div
                  key={node.pool.object_id}
                  className="flex flex-col items-center gap-1 rounded-md border px-4 py-3"
                >
                  <Tooltip
                    content={
                      <TextLink
                        className="block font-mono text-xs"
                        href={explorer.buildObjectUrl(node.pool.object_id)}
                      >
                        {formatId(node.pool.object_id)}
                      </TextLink>
                    }
                  >
                    <TLabelSans>
                      {EXCHANGE_NAME_MAP[node.pool.sui_exchange] ??
                        node.pool.sui_exchange}
                    </TLabelSans>
                  </Tooltip>

                  <Tooltip
                    content={
                      <TBody className="text-xs">
                        {+amountIn}{" "}
                        <TextLink
                          href={explorer.buildCoinUrl(node.amount_in.coin_type)}
                        >
                          {node.amount_in.ticker}
                        </TextLink>
                        {" → "}
                        {+amountOut}{" "}
                        <TextLink
                          href={explorer.buildCoinUrl(
                            node.amount_out.coin_type,
                          )}
                        >
                          {node.amount_out.ticker}
                        </TextLink>
                      </TBody>
                    }
                  >
                    <div
                      className="flex flex-row items-center gap-2"
                      style={
                        {
                          "--bg-color": "hsl(var(--popover))",
                        } as CSSProperties
                      }
                    >
                      <TokenLogos
                        className="h-4 w-4"
                        tokens={[node.amount_in, node.amount_out].map((t) => ({
                          coinType: t.coin_type,
                          symbol: t.ticker,
                          iconUrl: t.icon_url,
                        }))}
                      />

                      <TBody>
                        {node.amount_in.ticker}
                        <span className="font-sans">/</span>
                        {node.amount_out.ticker}
                      </TBody>
                    </div>
                  </Tooltip>
                </div>
              );
            })}

            <div className="rounded-md bg-muted/10 px-3 py-2">
              <TokenAmount token={tokenOut} amount={quoteAmountOut} />
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
