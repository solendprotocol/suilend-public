import { useState } from "react";

import { VerifiedToken } from "@hop.ag/sdk";
import BigNumber from "bignumber.js";
import { Check, ChevronDown, Search } from "lucide-react";

import Dialog from "@/components/dashboard/Dialog";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import TextLink from "@/components/shared/TextLink";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useSwapContext } from "@/contexts/SwapContext";
import { ParsedCoinBalance } from "@/lib/coinBalance";
import { SUI_COINTYPE, isSui } from "@/lib/coinType";
import { formatId, formatToken } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TokenSelectionDialogProps {
  tokens: VerifiedToken[];
  token: VerifiedToken;
  onSelectToken: (token: VerifiedToken) => void;
}

export default function TokenSelectionDialog({
  tokens,
  token,
  onSelectToken,
}: TokenSelectionDialogProps) {
  const { explorer, ...appContext } = useAppContext();
  const data = appContext.data as AppData;

  const swapContext = useSwapContext();
  const coinBalancesMap = swapContext.coinBalancesMap as Record<
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
          {token.ticker}
        </Button>
      }
      dialogContentProps={{ className: "max-w-lg" }}
      title="Select token"
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
                "gap-1.5 rounded-full border hover:border-transparent",
                isSelected && "border-transparent bg-muted/15",
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
              {t.ticker}
            </Button>
          );
        })}
      </div>

      <Separator />

      <div className="relative w-full overflow-auto">
        {filteredTokenList.length > 0 ? (
          filteredTokenList.map((t) => {
            const tokenBalance =
              coinBalancesMap[t.coin_type]?.balance ?? new BigNumber(0);
            const isSelected = t.coin_type === token.coin_type;

            return (
              <div
                key={t.coin_type}
                className={cn(
                  "flex w-full cursor-pointer flex-row justify-between p-4 transition-colors hover:bg-muted/10",
                  isSelected &&
                    "bg-muted/15 shadow-[inset_2px_0_0_0_hsl(var(--foreground))]",
                )}
                onClick={() => onTokenClick(t)}
              >
                <div className="flex w-full flex-row items-center gap-3">
                  <TokenLogo
                    showTooltip
                    imageProps={{ className: "rounded-full" }}
                    token={{
                      coinType: t.coin_type,
                      symbol: t.ticker,
                      iconUrl: t.icon_url,
                    }}
                  />

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row items-center gap-2">
                      <TBody className="w-max">{t.ticker}</TBody>
                      {isSelected && (
                        <Check className="h-4 w-4 text-foreground" />
                      )}
                    </div>
                    <TLabelSans className="w-max">{t.name}</TLabelSans>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <TBody className="w-max">
                    {formatToken(tokenBalance, { exact: false })} {t.ticker}
                  </TBody>
                  <TextLink
                    className="block w-max text-xs text-muted-foreground no-underline hover:text-foreground"
                    href={explorer.buildCoinUrl(t.coin_type)}
                  >
                    {isSui(t.coin_type) ? SUI_COINTYPE : formatId(t.coin_type)}
                  </TextLink>
                </div>
              </div>
            );
          })
        ) : (
          <TLabelSans className="py-4 text-center">
            {tokenList.length === 0
              ? "No tokens"
              : `No tokens matching "${filter}"`}
          </TLabelSans>
        )}
      </div>
    </Dialog>
  );
}
