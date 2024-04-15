import NextLink from "next/link";

import { Droplet, Server } from "lucide-react";

import DiscordIcon from "@/components/assets/DiscordIcon";
import XIcon from "@/components/assets/XIcon";
import HeaderBase from "@/components/layout/HeaderBase";
import Logo from "@/components/layout/Logo";
import Button from "@/components/shared/Button";
import { Ticker } from "@/components/shared/Ticker";
import TokenIcon from "@/components/shared/TokenIcon";
import { TBody, TTitle } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { formatPercent } from "@/lib/format";
import { getFilteredRewards, getTotalAprPercent } from "@/lib/liquidityMining";
import { DASHBOARD_URL, DISCORD_URL, X_URL } from "@/lib/navigation";
import Lava from "@/pages/Lava";

export default function LandingMobile() {
  const { data } = useAppContext();

  return (
    <div className="absolute block flex h-full w-full flex-col md:hidden">
      <Lava />
      <HeaderBase>
        <Logo />

        <NextLink href={DASHBOARD_URL}>
          <Button className="uppercase shadow-[0_5px_15px_0px_rgba(0,59,186,0.5)]">
            Launch app
          </Button>
        </NextLink>
      </HeaderBase>

      <div className="flex flex-col gap-8 pt-16">
        <div className="w-full items-center px-4 text-[34px] uppercase">
          Lending and borrowing platform on Sui.
        </div>
        <div className="flex w-full flex-col gap-4">
          <div
            className="border-b border-t border-secondary bg-[radial-gradient(128.40%_300.55%_at_-50.76%_132.29%,rgba(0,59,187,1)_0%,rgba(255,255,255,0.00)_100%)]"
            style={{ clipPath: "inset(0 0 0 0)" }}
          >
            <Lava filtered />
            <TTitle className="px-4 py-4 text-[20px] uppercase text-primary-foreground">
              Why <br /> Suilend?
            </TTitle>
          </div>

          <div className="border-line flex flex-1 flex-col items-start justify-between gap-8 py-4">
            <div className="flex items-center justify-between text-muted">
              <Server width={64} />
              <TBody className="max-w-[300px] text-[16px] uppercase text-muted-foreground">
                3+ years of experience running Solend
              </TBody>
            </div>
            <div className="flex items-center justify-between text-muted">
              <Droplet width={64} />
              <TBody className="max-w-[300px] text-[16px] uppercase text-muted-foreground">
                Incentive program
              </TBody>
            </div>
          </div>
        </div>

        <div className="mx-4 flex h-full flex-col items-end justify-between gap-4 rounded rounded-[10px] border border-secondary p-4">
          <div className="flex w-full justify-center">
            <TTitle className="text-[24px] uppercase text-primary-foreground">
              Money market built on the best chain for developers.
            </TTitle>
          </div>

          <div className="flex w-full justify-between gap-4">
            <NextLink href={DASHBOARD_URL}>
              <Button className="uppercase shadow-[0_5px_15px_0px_rgba(0,59,186,0.5)]">
                Launch app
              </Button>
            </NextLink>
            <div className="flex gap-4">
              <a href={X_URL} target="_blank">
                <Button
                  className="flex items-center justify-center uppercase shadow-[0_5px_15px_0px_rgba(0,59,186,0.5)]"
                  size="icon"
                >
                  <XIcon />
                </Button>
              </a>
              <a href={DISCORD_URL} target="_blank">
                <Button
                  className="flex items-center justify-center uppercase shadow-[0_5px_15px_0px_rgba(0,59,186,0.5)]"
                  size="icon"
                >
                  <DiscordIcon />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {data && (
          <div className="h-20 w-full border-b border-t bg-background py-2">
            <Ticker
              slideSpeed="30s"
              items={data.lendingMarket.reserves.map((reserve) => {
                const totalDepositAprPercent = getTotalAprPercent(
                  reserve.depositAprPercent,
                  getFilteredRewards(data.rewardMap[reserve.coinType].deposit),
                );

                return {
                  id: reserve.coinType,
                  text: (
                    <div className="flex flex-row items-center gap-4 py-2">
                      <TokenIcon
                        coinType={reserve.coinType}
                        symbol={reserve.symbol}
                        url={reserve.iconUrl}
                      />
                      <TBody>
                        {reserve.symbol} {formatPercent(totalDepositAprPercent)}{" "}
                        APR
                      </TBody>
                    </div>
                  ),
                };
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
