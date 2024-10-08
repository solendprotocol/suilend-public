import { useRef } from "react";

import { CoinBalance, SuiClient } from "@mysten/sui/client";
import { normalizeStructTag } from "@mysten/sui/utils";
import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";
import useSWR from "swr";

import { phantom } from "@suilend/sdk/_generated/_framework/reified";
import { LendingMarket } from "@suilend/sdk/_generated/suilend/lending-market/structs";
import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  SuilendClient,
} from "@suilend/sdk/client";
import { parseLendingMarket } from "@suilend/sdk/parsers/lendingMarket";
import { parseObligation } from "@suilend/sdk/parsers/obligation";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import * as simulate from "@suilend/sdk/utils/simulate";

import { SuiPriceServiceConnection } from "@pyth-sdk";

import { AppContext, AppData } from "@/contexts/AppContext";
import { ParsedCoinBalance, parseCoinBalances } from "@/lib/coinBalance";
import { getCoinMetadataMap } from "@/lib/coinMetadata";
import { formatRewards } from "@/lib/liquidityMining";

export default function useFetchAppData(
  suiClient: SuiClient,
  address: string | undefined,
) {
  // Suilend client
  const suilendClientRef = useRef<AppContext["suilendClient"]>(null);

  // Data
  const dataFetcher = async () => {
    const now = Math.floor(Date.now() / 1000);
    const rawLendingMarket = await LendingMarket.fetch(
      suiClient as any,
      phantom(LENDING_MARKET_TYPE),
      LENDING_MARKET_ID,
    );

    const refreshedRawReserves = await simulate.refreshReservePrice(
      rawLendingMarket.reserves.map((r) =>
        simulate.compoundReserveInterest(r, now),
      ),
      new SuiPriceServiceConnection("https://hermes.pyth.network"),
    );

    if (!suilendClientRef.current) {
      suilendClientRef.current =
        await SuilendClient.initializeWithLendingMarket(
          rawLendingMarket,
          suiClient,
        );
    } else suilendClientRef.current.lendingMarket = rawLendingMarket;

    const coinTypes: string[] = [];
    refreshedRawReserves.forEach((r) => {
      coinTypes.push(normalizeStructTag(r.coinType.name));

      [
        ...r.depositsPoolRewardManager.poolRewards,
        ...r.borrowsPoolRewardManager.poolRewards,
      ].forEach((pr) => {
        if (!pr) return;
        coinTypes.push(normalizeStructTag(pr.coinType.name));
      });
    });
    const uniqueCoinTypes = Array.from(new Set(coinTypes));

    const coinMetadataMap = await getCoinMetadataMap(
      suiClient,
      uniqueCoinTypes,
    );

    const lendingMarket = parseLendingMarket(
      rawLendingMarket,
      refreshedRawReserves,
      coinMetadataMap,
      now,
    );

    const reserveMap = lendingMarket.reserves.reduce(
      (acc, reserve) => ({ ...acc, [reserve.coinType]: reserve }),
      {},
    ) as Record<string, ParsedReserve>;

    let lendingMarketOwnerCapId, obligationOwnerCaps, obligations;
    let coinBalancesRaw: CoinBalance[] = [];
    let coinBalancesMap: Record<string, ParsedCoinBalance> = {};

    if (address) {
      lendingMarketOwnerCapId = await SuilendClient.getLendingMarketOwnerCapId(
        address,
        rawLendingMarket.$typeArgs,
        suiClient,
      );

      obligationOwnerCaps = await SuilendClient.getObligationOwnerCaps(
        address,
        rawLendingMarket.$typeArgs,
        suiClient,
      );

      if (obligationOwnerCaps.length > 0) {
        if (obligationOwnerCaps.length > 1) {
          const obligationOwnerCapTimestampsMs = (
            await Promise.all(
              obligationOwnerCaps.map((ownerCap) =>
                suiClient.queryTransactionBlocks({
                  limit: 1,
                  order: "ascending",
                  filter: { ChangedObject: ownerCap.id },
                  options: { showRawInput: true },
                }),
              ),
            )
          ).map((res) =>
            res?.data?.[0]?.timestampMs
              ? +(res.data[0].timestampMs as string)
              : 0,
          );

          obligationOwnerCaps = obligationOwnerCaps
            .map((ownerCap, index) => ({
              ...ownerCap,
              timestampMs: obligationOwnerCapTimestampsMs[index],
            }))
            .slice()
            .sort((a, b) => a.timestampMs - b.timestampMs);
        }

        const rawObligations = await Promise.all(
          obligationOwnerCaps.map((ownerCap) =>
            SuilendClient.getObligation(
              ownerCap.obligationId,
              rawLendingMarket.$typeArgs,
              suiClient,
            ),
          ),
        );

        obligations = rawObligations
          .map((rawObligation) =>
            simulate.refreshObligation(rawObligation, refreshedRawReserves),
          )
          .map((refreshedObligation) =>
            parseObligation(refreshedObligation, reserveMap),
          );
      }

      // Wallet assets
      coinBalancesRaw = (
        await suiClient.getAllBalances({
          owner: address,
        })
      )
        .map((cb) => ({ ...cb, coinType: normalizeStructTag(cb.coinType) }))
        .sort((a, b) => (a.coinType < b.coinType ? -1 : 1));

      const reserveCoinTypes = lendingMarket.reserves.map(
        (reserve) => reserve.coinType,
      );
      const uniqueReserveCoinTypes = Array.from(new Set(reserveCoinTypes));

      coinBalancesMap = parseCoinBalances(
        coinBalancesRaw,
        uniqueReserveCoinTypes,
        reserveMap,
      );
    }

    const rewardMap = formatRewards(reserveMap, coinMetadataMap, obligations);

    return {
      lendingMarket,
      lendingMarketOwnerCapId: lendingMarketOwnerCapId ?? undefined,
      reserveMap,
      obligationOwnerCaps,
      obligations,
      coinBalancesMap,
      coinMetadataMap,
      rewardMap,
      coinBalancesRaw,
    } as AppData;
  };

  const { data, mutate } = useSWR<AppContext["data"]>(
    `appData-${address}`,
    dataFetcher,
    {
      refreshInterval: 30 * 1000,
      onSuccess: (data) => {
        console.log("Refreshed app data", data);
      },
      onError: (err) => {
        toast.error(
          "Failed to refresh app data. Please check your internet connection or change RPC providers in Settings.",
          {
            description: (err as Error)?.message || "An unknown error occured",
          },
        );
        Sentry.captureException(err);
        console.error(err);
      },
    },
  );

  return {
    data,
    mutate,
    suilendClient: suilendClientRef.current,
  };
}
