import { useState } from "react";

import BigNumber from "bignumber.js";
import { AlertTriangle } from "lucide-react";

import Dialog from "@/components/dashboard/Dialog";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBodySans, TLabelSans } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import {
  NORMALIZED_USDC_COINTYPE,
  NORMALIZED_USDT_COINTYPE,
} from "@/lib/coinType";
import { LOOPING_THRESHOLD } from "@/lib/constants";

export default function LoopingDialog() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  const loopedAssetCoinTypes = (() => {
    if (data.obligations === undefined || data.obligations.length === 0)
      return [];

    let result: string[][] = [];
    data.lendingMarket.reserves.forEach((reserve) => {
      const outCoinTypes =
        reserve.coinType === NORMALIZED_USDC_COINTYPE
          ? [reserve.coinType, NORMALIZED_USDT_COINTYPE]
          : reserve.coinType === NORMALIZED_USDT_COINTYPE
            ? [reserve.coinType, NORMALIZED_USDC_COINTYPE]
            : [reserve.coinType];

      outCoinTypes.forEach((outCoinType) => {
        const amountsAcrossObligations = (data.obligations ?? []).reduce(
          (acc, obligation) => ({
            depositedAmount: acc.depositedAmount.plus(
              obligation.deposits.find((d) => d.coinType === reserve.coinType)
                ?.depositedAmount ?? new BigNumber(0),
            ),
            borrowedAmount: acc.borrowedAmount.plus(
              obligation.borrows.find((b) => b.coinType === outCoinType)
                ?.borrowedAmount ?? new BigNumber(0),
            ),
          }),
          {
            depositedAmount: new BigNumber(0),
            borrowedAmount: new BigNumber(0),
          },
        );

        if (
          amountsAcrossObligations.depositedAmount.gt(LOOPING_THRESHOLD) &&
          amountsAcrossObligations.borrowedAmount.gt(LOOPING_THRESHOLD)
        )
          result.push([reserve.coinType, outCoinType]);
      });
    });

    if (
      result.find(
        (coinTypes) =>
          coinTypes[0] === NORMALIZED_USDT_COINTYPE &&
          coinTypes[1] === NORMALIZED_USDT_COINTYPE,
      ) &&
      result.find(
        (coinTypes) =>
          coinTypes[0] === NORMALIZED_USDC_COINTYPE &&
          coinTypes[1] === NORMALIZED_USDC_COINTYPE,
      )
    ) {
      result = result.filter(
        (coinTypes) =>
          !(
            coinTypes[0] === NORMALIZED_USDT_COINTYPE &&
            coinTypes[1] === NORMALIZED_USDC_COINTYPE
          ) &&
          !(
            coinTypes[0] === NORMALIZED_USDC_COINTYPE &&
            coinTypes[1] === NORMALIZED_USDT_COINTYPE
          ),
      );
    }

    return result;
  })();

  // State
  const [isOpen, setIsOpen] = useState<boolean>(
    loopedAssetCoinTypes.length > 0,
  );
  const onOpenChange = (_isOpen: boolean) => {
    setIsOpen(_isOpen);
  };

  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      dialogContentProps={{ className: "max-w-md border-warning/50" }}
      drawerContentProps={{ className: "border-warning/50" }}
      headerProps={{
        className: "pb-0",
        titleClassName: "text-warning",
        titleIcon: <AlertTriangle />,
        title: "Looped assets",
      }}
      isAutoHeight
    >
      <div className="flex flex-col gap-4 p-4">
        <TLabelSans className="text-foreground">
          You are looping (depositing and borrowing the same asset, or
          USDT-USDC) which is penalized to receive less SUI incentives.
          Eliminate looping to maximize rewards.
        </TLabelSans>

        <Separator />

        <div className="flex flex-col gap-2">
          <TBodySans>Looped positions</TBodySans>

          {loopedAssetCoinTypes.map((coinTypes) => {
            const coinsMetadata = coinTypes.map(
              (coinType) => data.coinMetadataMap[coinType],
            );

            return (
              <div
                key={coinTypes.join(".")}
                className="flex flex-row items-center gap-1.5"
              >
                <TokenLogo
                  className="h-4 w-4"
                  token={{
                    coinType: coinTypes[0],
                    symbol: coinsMetadata[0].symbol,
                    iconUrl: coinsMetadata[0].iconUrl,
                  }}
                />
                <TLabelSans>
                  {coinsMetadata[0].symbol} deposits{" "}
                  {coinTypes[0] === coinTypes[1] ? "and borrows" : "and"}
                </TLabelSans>
                {coinTypes[0] !== coinTypes[1] && (
                  <>
                    <TokenLogo
                      className="h-4 w-4"
                      token={{
                        coinType: coinTypes[1],
                        symbol: coinsMetadata[1].symbol,
                        iconUrl: coinsMetadata[1].iconUrl,
                      }}
                    />
                    <TLabelSans>{coinsMetadata[1].symbol} borrows</TLabelSans>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
