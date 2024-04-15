import Image from "next/image";
import NextLink from "next/link";

import { Droplet, Server } from "lucide-react";

import DiscordIcon from "@/components/assets/DiscordIcon";
import XIcon from "@/components/assets/XIcon";
import Button from "@/components/shared/Button";
import { Ticker } from "@/components/shared/Ticker";
import TokenIcon from "@/components/shared/TokenIcon";
import { TBody, TTitle } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { formatPercent } from "@/lib/format";
import { getFilteredRewards, getTotalAprPercent } from "@/lib/liquidityMining";
import { DASHBOARD_URL, DISCORD_URL, X_URL } from "@/lib/navigation";
import Lava from "@/pages/Lava";
import suilendLogo from "@/public/suilend.svg";

export default function Landing() {
  const { data } = useAppContext();

  return (
    <div className="absolute flex hidden h-full w-full flex-col overflow-hidden md:flex">
      <div className="relative flex w-full flex-1">
        <div
          className="absolute h-full w-full pl-16 pt-12"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          <Lava />
          <div className="flex h-full w-[calc(66.6%-32px)] flex-col justify-between overflow-y-auto">
            <div className="flex flex-col gap-8">
              <Image
                src={suilendLogo}
                width={64}
                height={64}
                alt="Suilend logo"
              />

              <div className="w-full max-w-[800px] items-center text-[53px] uppercase">
                Lending and borrowing platform on Sui.
              </div>
              <NextLink href={DASHBOARD_URL} className="w-fit">
                <Button className="uppercase shadow-[0_5px_15px_0px_rgba(0,59,186,0.5)]">
                  Launch app
                </Button>
              </NextLink>
            </div>

            <div className="mt-6 flex pb-8">
              <div className="flex flex-col justify-center border-t border-secondary">
                <TTitle className="text-[20px] uppercase text-primary-foreground">
                  Why <br /> Suilend?
                </TTitle>
              </div>

              <div className="flex items-center gap-4 border-t py-4">
                <div className="flex flex-col justify-center text-muted-foreground">
                  <div className="flex h-[64px] flex-col justify-center">
                    <Server width={64} />
                  </div>
                  <div className="flex h-[64px] flex-col justify-center">
                    <Droplet width={64} />
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex h-[64px] flex-col justify-center">
                    <TBody className="max-w-[300px] text-[16px] uppercase text-muted-foreground">
                      3+ years of experience running Solend
                    </TBody>
                  </div>
                  <div className="flex h-[64px] flex-col justify-center">
                    <TBody className="max-w-[300px] text-[16px] uppercase text-muted-foreground">
                      Incentive program
                    </TBody>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-2/3 xl:w-1/2" />
        <div
          className="hidden h-full w-1/4 border-l border-r bg-background xl:flex"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          <div className="absolute h-full w-full bg-[radial-gradient(128.40%_69.55%_at_-80.76%_32.29%,rgba(0,59,187,1)_0%,rgba(255,255,255,0.00)_100%)]" />
          <Lava filtered className="left-0" />
        </div>
        <div
          className="h-full w-1/3 p-3 xl:w-1/4"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          <div className="md flex h-full flex-col items-end justify-between rounded rounded-[10px] border border-secondary p-4">
            <NextLink href={DASHBOARD_URL}>
              <Button className="uppercase shadow-[0_5px_15px_0px_rgba(0,59,186,0.5)]">
                Launch app
              </Button>
            </NextLink>

            <div className="flex w-full justify-center">
              <TTitle className="w-64 text-[24px] uppercase text-primary-foreground">
                Money market built on the best chain for developers.
              </TTitle>
            </div>

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
      </div>
      {data && (
        <div className="w-full basis-[80px] border-t">
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
  );
}
