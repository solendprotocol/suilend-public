import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

import Dagre from "@dagrejs/dagre";
import { SuiExchange as HopSuiExchange, VerifiedToken } from "@hop.ag/sdk";
import { CoinMetadata } from "@mysten/sui/client";
import {
  RouterProtocolName as AftermathRouterProtocolName,
  RouterTradePath as AftermathRouterTradePath,
} from "aftermath-ts-sdk";
import BigNumber from "bignumber.js";
import { Route } from "lucide-react";
import ReactFlow, { Edge, Handle, Node, Position } from "reactflow";

import Dialog from "@/components/dashboard/Dialog";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import TokenLogo from "@/components/shared/TokenLogo";
import TokenLogos from "@/components/shared/TokenLogos";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import {
  AF_EXCHANGE_NAME_MAP,
  HOP_EXCHANGE_NAME_MAP,
  UnifiedQuote,
  UnifiedQuoteType,
  useSwapContext,
} from "@/contexts/SwapContext";
import { getCoinMetadataMap } from "@/lib/coinMetadata";
import { formatId, formatList, formatToken } from "@/lib/format";
import { cn } from "@/lib/utils";
import "reactflow/dist/style.css";

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes: any[], edges: any[], options: any) => {
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => g.setNode(node.id, node));

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - node.width / 2;
      const y = position.y - node.height / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const useGetCoinMetadataMap = (coinTypes: string[]) => {
  const { suiClient } = useAppContext();

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

type QuoteNodeWithTokens = {
  object_id: string;
  amount_in: { amount: bigint } & VerifiedToken;
  amount_out: { amount: bigint } & VerifiedToken;
} & (
  | { sui_exchange: HopSuiExchange }
  | { protocol: AftermathRouterProtocolName }
);

const START_END_NODE_WIDTH = 200; // px
const START_END_NODE_HEIGHT = 36; // px

interface StartEndNodeProps {
  data: {
    isStart?: boolean;
    token: VerifiedToken;
    amount: BigNumber;
  };
}

function StartEndNode({ data }: StartEndNodeProps) {
  const { isStart, token, amount } = data;

  return (
    <>
      {!isStart && <Handle type="target" position={Position.Left} />}
      <div
        className={cn(
          "flex flex-row justify-center",
          isStart ? "justify-end" : "justify-start",
        )}
        style={{
          width: `${START_END_NODE_WIDTH}px`,
          height: `${START_END_NODE_HEIGHT}px`,
        }}
      >
        <div className="w-max rounded-md bg-muted/10 px-3 py-2">
          <Tooltip
            title={`${formatToken(amount, { dp: token.decimals })} ${token.ticker}`}
          >
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
                {formatToken(amount, { exact: false })} {token.ticker}
              </TBody>
            </div>
          </Tooltip>
        </div>
      </div>
      {isStart && <Handle type="source" position={Position.Right} />}
    </>
  );
}

const EXCHANGE_NODE_WIDTH = 160; // px
const EXCHANGE_NODE_HEIGHT = 12 + 16 + 4 + 20 + 12; // px

interface ExchangeNodeProps {
  data: QuoteNodeWithTokens;
}

function ExchangeNode({ data }: ExchangeNodeProps) {
  const { explorer } = useAppContext();

  const amountIn = BigNumber(data.amount_in.amount.toString()).div(
    10 ** data.amount_in.decimals,
  );
  const amountOut = BigNumber(data.amount_out.amount.toString()).div(
    10 ** data.amount_out.decimals,
  );

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        className="flex flex-col items-center gap-1.5 rounded-md bg-card px-4 py-3"
        style={{
          width: `${EXCHANGE_NODE_WIDTH}px`,
          height: `${EXCHANGE_NODE_HEIGHT}px`,
        }}
      >
        <Tooltip
          content={
            <TextLink
              className="block font-mono text-xs"
              href={explorer.buildObjectUrl(data.object_id)}
            >
              {formatId(data.object_id)}
            </TextLink>
          }
        >
          <TLabelSans>
            {"sui_exchange" in data
              ? (HOP_EXCHANGE_NAME_MAP[data.sui_exchange] ?? data.sui_exchange)
              : (AF_EXCHANGE_NAME_MAP[data.protocol] ?? data.protocol)}
          </TLabelSans>
        </Tooltip>

        <Tooltip
          contentProps={{ style: { maxWidth: "none" } }}
          content={
            <TBody className="text-xs">
              {formatToken(amountIn, { dp: data.amount_in.decimals })}{" "}
              <TextLink href={explorer.buildCoinUrl(data.amount_in.coin_type)}>
                {data.amount_in.ticker}
              </TextLink>
              {" → "}
              {formatToken(amountOut, { dp: data.amount_out.decimals })}{" "}
              <TextLink href={explorer.buildCoinUrl(data.amount_out.coin_type)}>
                {data.amount_out.ticker}
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
              tokens={[data.amount_in, data.amount_out].map((t) => ({
                coinType: t.coin_type,
                symbol: t.ticker,
                iconUrl: t.icon_url,
              }))}
            />

            <TBody>
              {data.amount_in.ticker}
              <span className="font-sans">/</span>
              {data.amount_out.ticker}
            </TBody>
          </div>
        </Tooltip>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

interface NodeChartProps {
  quote: UnifiedQuote;
  quoteNodesWithTokens: QuoteNodeWithTokens[];
}

function NodeChart({ quote, quoteNodesWithTokens }: NodeChartProps) {
  const swapContext = useSwapContext();
  const tokenIn = swapContext.tokenIn as VerifiedToken;
  const tokenOut = swapContext.tokenOut as VerifiedToken;

  // Layout
  const initialNodesEdges = (() => {
    // Nodes
    const quoteAmountIn = BigNumber(quote.amount_in.toString());
    const quoteAmountOut = BigNumber(quote.amount_out.toString());

    const initialNodes: Node[] = [];
    initialNodes.push({
      id: "start",
      type: "startEnd",
      position: { x: 0, y: 0 },
      width: START_END_NODE_WIDTH,
      height: START_END_NODE_HEIGHT,
      data: {
        isStart: true,
        token: tokenIn,
        amount: quoteAmountIn,
      },
    });
    quoteNodesWithTokens.forEach((node, index) => {
      initialNodes.push({
        id:
          quote.type === UnifiedQuoteType.HOP
            ? node.object_id
            : `${node.object_id}_${index}`,
        type: "exchange",
        position: { x: 0, y: 0 },
        width: EXCHANGE_NODE_WIDTH,
        height: EXCHANGE_NODE_HEIGHT,
        data: node,
      });
    });
    initialNodes.push({
      id: "end",
      type: "startEnd",
      position: { x: 0, y: 0 },
      width: START_END_NODE_WIDTH,
      height: START_END_NODE_HEIGHT,
      data: {
        token: tokenOut,
        amount: quoteAmountOut,
      },
    });

    // Edges
    const initialEdges: Edge[] = [];
    quoteNodesWithTokens.forEach((node, nodeIndex) => {
      if (quote.type === UnifiedQuoteType.HOP) {
        if (Object.keys(quote.quote.trade.edges).includes(node.object_id))
          return;
      } else {
        if (
          !quote.quote.routes
            .reduce(
              (acc, route) => [
                ...acc,
                ...route.paths.map((path, index) => ({
                  ...path,
                  isFirst: index === 0,
                })),
              ],
              [] as (AftermathRouterTradePath & { isFirst: boolean })[],
            )
            .some(
              (data, index) =>
                data.isFirst &&
                `${data.pool.pool_id}_${index}` ===
                  `${node.object_id}_${nodeIndex}`,
            )
        )
          return;
      }

      initialEdges.push({
        id:
          quote.type === UnifiedQuoteType.HOP
            ? `start-${node.object_id}`
            : `start-${node.object_id}_${nodeIndex}`,
        source: "start",
        target:
          quote.type === UnifiedQuoteType.HOP
            ? node.object_id
            : `${node.object_id}_${nodeIndex}`,
      });
    });

    if (quote.type === UnifiedQuoteType.HOP) {
      Object.entries(quote.quote.trade.edges).forEach(
        ([targetNodeObjectId, sourceNodeObjectIds]) => {
          sourceNodeObjectIds.forEach((sourceNodeObjectId) => {
            initialEdges.push({
              id: `${sourceNodeObjectId}-${targetNodeObjectId}`,
              source: sourceNodeObjectId,
              target: targetNodeObjectId,
            });
          });
        },
      );
    } else {
      let indexCount = 0;
      for (const route of quote.quote.routes) {
        route.paths.forEach((path, index) => {
          if (index > 0) {
            const sourcePath = route.paths[index - 1];
            initialEdges.push({
              id: `${sourcePath.pool.pool_id}_${indexCount - 1}-${path.pool.pool_id}_${indexCount}`,
              source: `${sourcePath.pool.pool_id}_${indexCount - 1}`,
              target: `${path.pool.pool_id}_${indexCount}`,
            });
          }
          indexCount += 1;
        });
      }
    }

    quoteNodesWithTokens.forEach((node, nodeIndex) => {
      if (quote.type === UnifiedQuoteType.HOP) {
        if (
          Object.values(quote.quote.trade.edges).flat().includes(node.object_id)
        )
          return;
      } else {
        if (
          !quote.quote.routes
            .reduce(
              (acc, route) => [
                ...acc,
                ...route.paths.map((path, index) => ({
                  ...path,
                  isLast: index === route.paths.length - 1,
                })),
              ],
              [] as (AftermathRouterTradePath & {
                isLast: boolean;
              })[],
            )
            .some(
              (data, index) =>
                data.isLast &&
                `${data.pool.pool_id}_${index}` ===
                  `${node.object_id}_${nodeIndex}`,
            )
        )
          return;
      }

      initialEdges.push({
        id:
          quote.type === UnifiedQuoteType.HOP
            ? `end-${node.object_id}`
            : `end-${node.object_id}_${nodeIndex}`,
        source:
          quote.type === UnifiedQuoteType.HOP
            ? node.object_id
            : `${node.object_id}_${nodeIndex}`,
        target: "end",
      });
    });

    // Layout
    const layouted = getLayoutedElements(initialNodes, initialEdges, {
      direction: "LR",
    });

    return {
      nodes: layouted.nodes,
      edges: layouted.edges,
    };
  })();

  const nodeTypes = useMemo(
    () => ({ startEnd: StartEndNode, exchange: ExchangeNode }),
    [],
  );

  return (
    <div className="h-full w-full pt-0 md:p-4">
      <ReactFlow
        nodeTypes={nodeTypes}
        defaultNodes={initialNodesEdges.nodes}
        defaultEdges={initialNodesEdges.edges}
        fitView
        fitViewOptions={{ padding: 0, minZoom: 0.25, maxZoom: 1 }}
      />
    </div>
  );
}

interface RoutingDialogProps {
  quote: UnifiedQuote;
}

export default function RoutingDialog({ quote }: RoutingDialogProps) {
  const swapContext = useSwapContext();
  const tokens = swapContext.tokens as VerifiedToken[];

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onOpenChange = (_isOpen: boolean) => {
    setIsOpen(_isOpen);
  };

  // Coin metadata
  const nodeTokenCoinTypes = useMemo(() => {
    const coinTypes: string[] = [];

    if (quote.type === UnifiedQuoteType.HOP) {
      for (const node of Object.values(quote.quote.trade.nodes)) {
        for (const coinType of [node.amount_in.token, node.amount_out.token]) {
          if (!coinTypes.includes(coinType)) coinTypes.push(coinType);
        }
      }
    } else {
      // Aftermath
      for (const path of quote.quote.routes.reduce(
        (acc, route) => [...acc, ...route.paths],
        [] as AftermathRouterTradePath[],
      )) {
        for (const coinType of [path.coinIn.type, path.coinOut.type]) {
          if (!coinTypes.includes(coinType)) coinTypes.push(coinType);
        }
      }
    }

    return coinTypes;
  }, [quote]);

  const coinMetadataMap = useGetCoinMetadataMap(nodeTokenCoinTypes);

  // Quote
  const quoteNodesWithTokens = useMemo(
    () =>
      quote.type === UnifiedQuoteType.HOP
        ? (Object.values(quote.quote.trade.nodes)
            .map((node) => {
              const inToken = tokens.find(
                (t) => t.coin_type === node.amount_in.token,
              );
              const outToken = tokens.find(
                (t) => t.coin_type === node.amount_out.token,
              );

              const inCoinMetadata = coinMetadataMap[node.amount_in.token];
              const outCoinMetadata = coinMetadataMap[node.amount_out.token];

              if (
                !(inToken || inCoinMetadata) ||
                !(outToken || outCoinMetadata)
              )
                return undefined;
              return {
                object_id: node.pool.object_id,
                sui_exchange: node.pool.sui_exchange,
                amount_in: {
                  amount: node.amount_in.amount,
                  ...({
                    coin_type: node.amount_in.token,
                    name: inToken?.name ?? inCoinMetadata?.name,
                    ticker: inToken?.ticker ?? inCoinMetadata?.symbol,
                    icon_url: inToken?.icon_url ?? inCoinMetadata?.iconUrl,
                    decimals: inToken?.decimals ?? inCoinMetadata?.decimals,
                  } as VerifiedToken),
                },
                amount_out: {
                  amount: node.amount_out.amount,
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
            .filter(Boolean) as QuoteNodeWithTokens[])
        : // Aftermath
          (quote.quote.routes
            .reduce(
              (acc, route) => [...acc, ...route.paths],
              [] as AftermathRouterTradePath[],
            )
            .map((path) => {
              const inToken = tokens.find(
                (t) => t.coin_type === path.coinIn.type,
              );
              const outToken = tokens.find(
                (t) => t.coin_type === path.coinOut.type,
              );

              const inCoinMetadata = coinMetadataMap[path.coinIn.type];
              const outCoinMetadata = coinMetadataMap[path.coinOut.type];

              if (
                !(inToken || inCoinMetadata) ||
                !(outToken || outCoinMetadata)
              )
                return undefined;
              return {
                object_id: path.pool.pool_id,
                protocol: path.protocolName,
                amount_in: {
                  amount: path.coinIn.amount,
                  ...({
                    coin_type: path.coinIn.type,
                    name: inToken?.name ?? inCoinMetadata?.name,
                    ticker: inToken?.ticker ?? inCoinMetadata?.symbol,
                    icon_url: inToken?.icon_url ?? inCoinMetadata?.iconUrl,
                    decimals: inToken?.decimals ?? inCoinMetadata?.decimals,
                  } as VerifiedToken),
                },
                amount_out: {
                  amount: path.coinOut.amount,
                  ...({
                    coin_type: path.coinOut.type,
                    name: outToken?.name ?? outCoinMetadata?.name,
                    ticker: outToken?.ticker ?? outCoinMetadata?.symbol,
                    icon_url: outToken?.icon_url ?? outCoinMetadata?.iconUrl,
                    decimals: outToken?.decimals ?? outCoinMetadata?.decimals,
                  } as VerifiedToken),
                },
              };
            })
            .filter(Boolean) as QuoteNodeWithTokens[]),
    [quote, tokens, coinMetadataMap],
  );

  const hopsCount =
    quote.type === UnifiedQuoteType.HOP
      ? Object.values(quote.quote.trade.nodes).length
      : quote.quote.routes.reduce((acc, route) => acc + route.paths.length, 0);
  const isLoading = quoteNodesWithTokens.length !== hopsCount;

  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      trigger={
        <TLabelSans className="max-w-max cursor-pointer overflow-hidden text-ellipsis text-nowrap transition-colors hover:text-foreground">
          {hopsCount} hop{hopsCount !== 1 && "s"}
          {" via "}
          {formatList(
            Array.from(
              new Set(
                quote.type === UnifiedQuoteType.HOP
                  ? Object.values(quote.quote.trade.nodes).map(
                      (node) =>
                        HOP_EXCHANGE_NAME_MAP[node.pool.sui_exchange] ??
                        node.pool.sui_exchange,
                    )
                  : quote.quote.routes
                      .reduce(
                        (acc, route) => [...acc, ...route.paths],
                        [] as AftermathRouterTradePath[],
                      )
                      .map(
                        (path) =>
                          AF_EXCHANGE_NAME_MAP[path.protocolName] ??
                          path.protocolName,
                      ),
              ),
            ),
          )}
        </TLabelSans>
      }
      dialogContentProps={{ className: "h-[600px]" }}
      headerProps={{
        className: "pb-0",
        titleIcon: <Route />,
        title: "Routing",
      }}
      isDialogAutoHeight
    >
      {isLoading ? (
        <div className="flex h-full w-full flex-row items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : (
        isOpen && (
          <NodeChart
            quote={quote}
            quoteNodesWithTokens={quoteNodesWithTokens}
          />
        )
      )}
    </Dialog>
  );
}
