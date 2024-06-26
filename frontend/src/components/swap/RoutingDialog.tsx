import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

import Dagre from "@dagrejs/dagre";
import { VerifiedToken } from "@hop.ag/sdk";
import { CoinMetadata, SuiClient } from "@mysten/sui.js/client";
import BigNumber from "bignumber.js";
import { Route } from "lucide-react";
import ReactFlow, { Edge, Handle, Node, Position } from "reactflow";

import Dialog from "@/components/dashboard/Dialog";
import Button from "@/components/shared/Button";
import Spinner from "@/components/shared/Spinner";
import TextLink from "@/components/shared/TextLink";
import TokenLogo from "@/components/shared/TokenLogo";
import TokenLogos from "@/components/shared/TokenLogos";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import {
  EXCHANGE_NAME_MAP,
  Quote,
  useSwapContext,
} from "@/contexts/SwapContext";
import useBreakpoint from "@/hooks/useBreakpoint";
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

type QuoteNode = Quote["trade"]["nodes"][0];
type QuoteNodeWithTokens = QuoteNode & {
  amount_in: QuoteNode["amount_in"] & VerifiedToken;
  amount_out: QuoteNode["amount_out"] & VerifiedToken;
};

const START_END_NODE_WIDTH = 240; // px
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

  const { md } = useBreakpoint();

  return (
    <>
      {!isStart && (
        <Handle type="target" position={md ? Position.Left : Position.Top} />
      )}
      <div
        className={cn(
          "flex flex-row justify-center",
          isStart ? "md:justify-end" : "md:justify-start",
        )}
        style={{
          width: `${START_END_NODE_WIDTH}px`,
          height: `${START_END_NODE_HEIGHT}px`,
        }}
      >
        <div className="flex flex-row items-center gap-1.5 rounded-md bg-muted/10 px-3 py-2">
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
      </div>
      {isStart && (
        <Handle
          type="source"
          position={md ? Position.Right : Position.Bottom}
        />
      )}
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

  const { md } = useBreakpoint();

  const amountIn = BigNumber(data.amount_in.amount.toString()).div(
    10 ** data.amount_in.decimals,
  );
  const amountOut = BigNumber(data.amount_out.amount.toString()).div(
    10 ** data.amount_out.decimals,
  );

  return (
    <>
      <Handle type="target" position={md ? Position.Left : Position.Top} />
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
              href={explorer.buildObjectUrl(data.pool.object_id)}
            >
              {formatId(data.pool.object_id)}
            </TextLink>
          }
        >
          <TLabelSans>
            {EXCHANGE_NAME_MAP[data.pool.sui_exchange] ??
              data.pool.sui_exchange}
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
      <Handle type="source" position={md ? Position.Right : Position.Bottom} />
    </>
  );
}

interface NodeChartProps {
  quote: Quote;
  quoteNodesWithTokens: QuoteNodeWithTokens[];
}

function NodeChart({ quote, quoteNodesWithTokens }: NodeChartProps) {
  const swapContext = useSwapContext();
  const tokenIn = swapContext.tokenIn as VerifiedToken;
  const tokenOut = swapContext.tokenOut as VerifiedToken;

  const { md } = useBreakpoint();

  // Layout
  const initialNodesEdges = (() => {
    // Nodes
    const quoteAmountIn = BigNumber(
      quote.trade.amount_in.amount.toString(),
    ).div(10 ** tokenIn.decimals);
    const quoteAmountOut = BigNumber(
      quote.trade.amount_out.amount.toString(),
    ).div(10 ** tokenOut.decimals);

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
    quoteNodesWithTokens.forEach((node) => {
      initialNodes.push({
        id: node.pool.object_id,
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
    quoteNodesWithTokens.forEach((node) => {
      if (Object.keys(quote.trade.edges).includes(node.pool.object_id)) return;

      initialEdges.push({
        id: `start-${node.pool.object_id}`,
        source: "start",
        target: node.pool.object_id,
      });
    });
    Object.entries(quote.trade.edges).forEach(
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
    quoteNodesWithTokens.forEach((node) => {
      if (Object.values(quote.trade.edges).flat().includes(node.pool.object_id))
        return;

      initialEdges.push({
        id: `end-${node.pool.object_id}`,
        source: node.pool.object_id,
        target: "end",
      });
    });

    // Layout
    const layouted = getLayoutedElements(initialNodes, initialEdges, {
      direction: md ? "LR" : "TB",
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
    <div className="h-full w-full">
      <ReactFlow
        nodeTypes={nodeTypes}
        defaultNodes={initialNodesEdges.nodes}
        defaultEdges={initialNodesEdges.edges}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
      />
    </div>
  );
}

interface RoutingDialogProps {
  quote: Quote;
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
    for (const node of Object.values(quote.trade.nodes)) {
      for (const coinType of [node.amount_in.token, node.amount_out.token]) {
        if (!coinTypes.includes(coinType)) coinTypes.push(coinType);
      }
    }

    return coinTypes;
  }, [quote]);

  const coinMetadataMap = useGetCoinMetadataMap(nodeTokenCoinTypes);

  // Quote
  const quoteNodesWithTokens = useMemo(
    () =>
      Object.values(quote.trade.nodes)
        .map((node) => {
          const inToken = tokens.find(
            (t) => t.coin_type === node.amount_in.token,
          );
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
        .filter(Boolean) as QuoteNodeWithTokens[],
    [quote, tokens, coinMetadataMap],
  );

  const hopsCount = Object.values(quote.trade.nodes).length;
  const isLoading =
    quoteNodesWithTokens.length !== Object.values(quote.trade.nodes).length;

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
      headerClassName="pb-0"
      titleIcon={<Route />}
      title="Routing"
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
