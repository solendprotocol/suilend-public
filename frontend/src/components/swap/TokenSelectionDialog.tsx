import { useEffect, useState } from "react";

import { VerifiedToken } from "@hop.ag/sdk";
import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";
import { Check, ChevronDown, Search, Wallet } from "lucide-react";

import Dialog from "@/components/dashboard/Dialog";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import TextLink from "@/components/shared/TextLink";
import TokenLogo from "@/components/shared/TokenLogo";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useSwapContext } from "@/contexts/SwapContext";
import { ParsedCoinBalance } from "@/lib/coinBalance";
import { SUI_COINTYPE, isCoinType, isSui } from "@/lib/coinType";
import { formatId, formatToken, replace0x } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TokenSelectionDialogProps {
  token: VerifiedToken;
  onSelectToken: (token: VerifiedToken) => void;
}

export default function TokenSelectionDialog({
  token,
  onSelectToken,
}: TokenSelectionDialogProps) {
  const { explorer, ...appContext } = useAppContext();
  const data = appContext.data as AppData;

  const { fetchTokensMetadata, ...restSwapContext } = useSwapContext();
  const tokens = restSwapContext.tokens as VerifiedToken[];
  const coinBalancesMap = restSwapContext.coinBalancesMap as Record<
    string,
    ParsedCoinBalance
  >;

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onOpenChange = (_isOpen: boolean) => {
    setIsOpen(_isOpen);
  };

  // Filter
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    if (
      !tokens.find((t) =>
        `${t.coin_type}${t.ticker}${t.name}`
          .toLowerCase()
          .includes(filter.toLowerCase()),
      ) &&
      isCoinType(filter)
    )
      fetchTokensMetadata([normalizeStructTag(filter)]);
  }, [tokens, filter, fetchTokensMetadata]);

  // Token list
  const PRIORITY_TOKEN_SYMBOLS = data.lendingMarket.reserves.map(
    (reserve) => reserve.symbol,
  );

  const priorityTokens = PRIORITY_TOKEN_SYMBOLS.map((symbol) =>
    tokens.find((t) => t.ticker === symbol),
  ).filter(Boolean) as VerifiedToken[];

  const tokensWithBalance = tokens.filter((t) =>
    (coinBalancesMap[t.coin_type]?.balance ?? new BigNumber(0)).gt(0),
  );

  const mainTokens = [
    ...priorityTokens.filter((t) =>
      tokensWithBalance.find((_t) => _t.coin_type === t.coin_type),
    ),
    ...priorityTokens.filter(
      (t) => !tokensWithBalance.find((_t) => _t.coin_type === t.coin_type),
    ),
    ...tokensWithBalance.filter(
      (t) => !priorityTokens.find((_t) => _t.coin_type === t.coin_type),
    ),
  ];
  const otherTokens = tokens.filter(
    (t) => !mainTokens.find((_t) => _t.coin_type === t.coin_type),
  );

  const tokenList = [...mainTokens, ...otherTokens];
  const filteredTokenList = tokenList.filter((t) =>
    `${t.coin_type}${t.ticker}${t.name}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );

  // Select token
  const onTokenClick = (t: VerifiedToken) => {
    onSelectToken(t);
    setTimeout(() => setIsOpen(false), 50);
    setTimeout(() => setFilter(""), 250);
  };

  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      trigger={
        <Button
          className="h-auto p-0 hover:bg-transparent"
          labelClassName="text-2xl"
          startIcon={
            <TokenLogo
              className="mr-1 h-5 w-5"
              imageProps={{ className: "rounded-full" }}
              token={{
                coinType: token.coin_type,
                symbol: token.ticker,
                iconUrl: token.icon_url,
              }}
            />
          }
          endIcon={<ChevronDown className="h-4 w-4 opacity-50" />}
          variant="ghost"
        >
          {token.ticker.slice(0, 10)}
        </Button>
      }
      dialogContentProps={{ className: "max-w-lg" }}
      headerProps={{ title: "Select token" }}
    >
      <div className="mx-4 mb-4 flex flex-row items-center gap-3 rounded-md bg-muted/5 px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <Input
            id="token-filter"
            type="text"
            placeholder="Search by token symbol, name or address"
            value={filter}
            onChange={setFilter}
            inputProps={{
              autoFocus: true,
              className: "font-sans bg-transparent border-0 px-0",
            }}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-row flex-wrap gap-2 px-4">
        {priorityTokens.map((t) => {
          const isSelected = t.coin_type === token.coin_type;

          return (
            <Button
              key={t.coin_type}
              className={cn(
                "gap-1.5 rounded-full border",
                isSelected
                  ? "border-transparent bg-muted/10"
                  : "hover:border-transparent",
              )}
              startIcon={
                <TokenLogo
                  className="h-4 w-4"
                  imageProps={{ className: "rounded-full" }}
                  token={{
                    coinType: t.coin_type,
                    symbol: t.ticker,
                    iconUrl: t.icon_url,
                  }}
                />
              }
              endIcon={
                isSelected ? (
                  <Check className="h-4 w-4 text-foreground" />
                ) : undefined
              }
              variant="ghost"
              onClick={() => onTokenClick(t)}
            >
              {/* TODO: Truncate symbol once the list of priority tokens includes non-reserves */}
              {t.ticker}
            </Button>
          );
        })}
      </div>

      <div className="relative flex w-full flex-col gap-[1px] overflow-auto">
        {filteredTokenList.length > 0 ? (
          filteredTokenList.map((t) => {
            const tokenBalance =
              coinBalancesMap[t.coin_type]?.balance ?? new BigNumber(0);
            const isSelected = t.coin_type === token.coin_type;

            return (
              <div
                key={t.coin_type}
                className={cn(
                  "flex w-full cursor-pointer p-4 transition-colors hover:bg-muted/10",
                  isSelected
                    ? "border-transparent bg-muted/10 shadow-[inset_2px_0_0_0_hsl(var(--foreground))]"
                    : "hover:border-transparent",
                )}
                onClick={() => onTokenClick(t)}
              >
                <div className="flex w-full flex-row items-center gap-3">
                  <TokenLogo
                    showTooltip
                    className="shrink-0"
                    imageProps={{ className: "rounded-full" }}
                    token={{
                      coinType: t.coin_type,
                      symbol: t.ticker,
                      iconUrl: t.icon_url,
                    }}
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex w-full flex-row items-center justify-between gap-4">
                      <div className="flex min-w-0 flex-row items-center gap-2">
                        <TBody className="overflow-hidden text-ellipsis text-nowrap">
                          {t.ticker}
                        </TBody>
                        {isSelected && (
                          <Check className="h-4 w-4 text-foreground" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-row items-center gap-1.5">
                        <Wallet className="h-3 w-3 shrink-0 text-foreground" />
                        <Tooltip
                          title={
                            tokenBalance.gt(0)
                              ? `${formatToken(tokenBalance, { dp: token.decimals })} ${t.ticker}`
                              : undefined
                          }
                        >
                          <TBody className="overflow-hidden text-ellipsis text-nowrap">
                            {formatToken(tokenBalance, { exact: false })}{" "}
                            {t.ticker}
                          </TBody>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-4">
                      <TLabelSans className="overflow-hidden text-ellipsis text-nowrap">
                        {t.name}
                      </TLabelSans>

                      <TextLink
                        className="block w-max shrink-0 text-xs text-muted-foreground no-underline hover:text-foreground"
                        href={explorer.buildCoinUrl(t.coin_type)}
                      >
                        {isSui(t.coin_type)
                          ? replace0x(SUI_COINTYPE)
                          : formatId(t.coin_type)}
                      </TextLink>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <TLabelSans className="py-4 text-center">
            {tokenList.length === 0
              ? "No tokens"
              : isCoinType(filter)
                ? "Fetching token metadata..."
                : `No tokens matching "${filter}"`}
          </TLabelSans>
        )}
      </div>
    </Dialog>
  );
}
