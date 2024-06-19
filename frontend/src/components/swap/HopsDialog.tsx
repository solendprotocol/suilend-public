import { useState } from "react";

import { GetQuoteResponse, VerifiedToken } from "@hop.ag/sdk";
import BigNumber from "bignumber.js";
import { MoveRight, Route } from "lucide-react";

import Dialog from "@/components/dashboard/Dialog";
import Button from "@/components/shared/Button";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { useSwapContext } from "@/contexts/SwapContext";
import { formatList } from "@/lib/format";

interface TokenAmountProps {
  token: VerifiedToken;
  amount: BigNumber;
}

function TokenAmount({ token, amount }: TokenAmountProps) {
  return (
    <div className="flex flex-row items-center gap-2">
      <TokenLogo
        className="h-4 w-4"
        coinType={token.coin_type}
        symbol={token.ticker}
        src={token.icon_url}
      />
      <TBody>
        {+amount} {token.ticker}
      </TBody>
    </div>
  );
}

interface HopsDialogProps {
  quote: GetQuoteResponse;
}

export default function HopsDialog({ quote }: HopsDialogProps) {
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

  const firstNodeObjectId = nodes.find((node) => {
    const nodeToken = tokens.find((t) => t.coin_type === node.amount_in.token);
    if (!nodeToken) return false;

    const nodeAmount = BigNumber(node.amount_in.amount.toString()).div(
      10 ** nodeToken.decimals,
    );

    return (
      nodeToken.coin_type === tokenIn.coin_type && nodeAmount.eq(quoteAmountIn)
    );
  })?.pool.object_id;

  const lastNodeObjectId = nodes.find((node) => {
    const nodeToken = tokens.find((t) => t.coin_type === node.amount_out.token);
    if (!nodeToken) return false;

    const nodeAmount = BigNumber(node.amount_out.amount.toString()).div(
      10 ** nodeToken.decimals,
    );

    return (
      nodeToken.coin_type === tokenOut.coin_type &&
      nodeAmount.eq(quoteAmountOut)
    );
  })?.pool.object_id;

  const sortedNodeObjectIds = [
    firstNodeObjectId,
    ...nodes
      .filter(
        (node) =>
          ![firstNodeObjectId, lastNodeObjectId].includes(node.pool.object_id),
      )
      .map((node) => node.pool.object_id),
    lastNodeObjectId,
  ].filter(Boolean) as string[];
  const sortedNodes = sortedNodeObjectIds
    .map((objectId) => nodes.find((node) => node.pool.object_id === objectId))
    .filter(Boolean) as typeof nodes;

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
                    (node) => node.pool.sui_exchange,
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

          {sortedNodes.map((node) => {
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
                <div className="flex h-5 flex-row items-center gap-1">
                  <TBody>{node.pool.sui_exchange} </TBody>
                  <OpenOnExplorerButton
                    url={explorer.buildObjectUrl(node.pool.object_id)}
                  />
                </div>

                {nodeTokenIn !== undefined &&
                  nodeTokenOut !== undefined &&
                  amountIn !== undefined &&
                  amountOut !== undefined && (
                    <div className="flex flex-row items-center gap-2">
                      <TokenAmount token={nodeTokenIn} amount={amountIn} />
                      <MoveRight className="h-4 w-4 text-foreground" />
                      <TokenAmount token={nodeTokenOut} amount={amountOut} />
                    </div>
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
