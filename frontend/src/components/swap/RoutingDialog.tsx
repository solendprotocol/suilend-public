import { CSSProperties, useState } from "react";

import { GetQuoteResponse, VerifiedToken } from "@hop.ag/sdk";
import BigNumber from "bignumber.js";
import { Route } from "lucide-react";

import Dialog from "@/components/dashboard/Dialog";
import Button from "@/components/shared/Button";
import TextLink from "@/components/shared/TextLink";
import TokenLogo from "@/components/shared/TokenLogo";
import TokenLogos from "@/components/shared/TokenLogos";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { EXCHANGE_NAME_MAP, useSwapContext } from "@/contexts/SwapContext";
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

  // Hops
  const hopsCount = Object.keys(quote.trade.nodes).length;
  const nodes = Object.values(quote.trade.nodes);

  const chainedNodeObjectIds: string[][] = [];
  Object.entries(quote.trade.edges).forEach(
    ([endNodeObjectId, nodeObjectIds]) => {
      chainedNodeObjectIds.push([...nodeObjectIds, endNodeObjectId]);
    },
  );
  chainedNodeObjectIds.push(
    ...Object.keys(quote.trade.nodes)
      .filter(
        (nodeObjectId) => !chainedNodeObjectIds.flat().includes(nodeObjectId),
      )
      .map((nodeObjectId) => [nodeObjectId]),
  );

  const chainedNodes = chainedNodeObjectIds.map(
    (nodeObjectIds) =>
      nodeObjectIds
        .map((nodeObjectId) =>
          nodes.find((node) => node.pool.object_id === nodeObjectId),
        )
        .filter(Boolean) as typeof nodes,
  );

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
        <div className="flex w-full min-w-max flex-col items-center gap-4">
          <div className="rounded-md bg-muted/10 px-3 py-2">
            <TokenAmount token={tokenIn} amount={quoteAmountIn} />
          </div>

          {chainedNodes.flat().map((node) => {
            const nodeTokenIn = tokens.find(
              (t) => t.coin_type === node.amount_in.token,
            );
            const nodeTokenOut = tokens.find(
              (t) => t.coin_type === node.amount_out.token,
            );

            const amountIn = nodeTokenIn
              ? BigNumber(node.amount_in.amount.toString()).div(
                  10 ** nodeTokenIn.decimals,
                )
              : undefined;
            const amountOut = nodeTokenOut
              ? BigNumber(node.amount_out.amount.toString()).div(
                  10 ** nodeTokenOut.decimals,
                )
              : undefined;

            return (
              <div
                key={node.pool.object_id}
                className="flex flex-col items-center gap-2 rounded-md border px-4 py-2"
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
                  <TBody className="uppercase">
                    {EXCHANGE_NAME_MAP[node.pool.sui_exchange] ??
                      node.pool.sui_exchange}
                  </TBody>
                </Tooltip>

                {nodeTokenIn !== undefined &&
                  nodeTokenOut !== undefined &&
                  amountIn !== undefined &&
                  amountOut !== undefined && (
                    <Tooltip
                      content={
                        <TBody className="text-xs">
                          {+amountIn}{" "}
                          <TextLink
                            href={explorer.buildCoinUrl(nodeTokenIn.coin_type)}
                          >
                            {nodeTokenIn.ticker}
                          </TextLink>
                          {" → "}
                          {+amountOut}{" "}
                          <TextLink
                            href={explorer.buildCoinUrl(nodeTokenOut.coin_type)}
                          >
                            {nodeTokenOut.ticker}
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
                          tokens={[nodeTokenIn, nodeTokenOut].map((t) => ({
                            coinType: t.coin_type,
                            symbol: t.ticker,
                            iconUrl: t.icon_url,
                          }))}
                        />

                        <TBody>
                          {nodeTokenIn.ticker}
                          <span className="font-sans">/</span>
                          {nodeTokenOut.ticker}
                        </TBody>
                      </div>
                    </Tooltip>
                  )}
              </div>
            );
          })}

          <div className="rounded-md bg-muted/10 px-3 py-2">
            <TokenAmount token={tokenOut} amount={quoteAmountOut} />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
