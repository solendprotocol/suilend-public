import { useRef } from "react";

import { CoinBalance, SuiClient } from "@mysten/sui.js/client";
import { normalizeStructTag } from "@mysten/sui.js/utils";
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
      suiClient,
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
          )
          .sort((a, b) => a.id - b.id);
      }

      // Wallet assets
      coinBalancesRaw = (
        await suiClient.getAllBalances({
          owner: address,
        })
      ).map((cb) => ({ ...cb, coinType: normalizeStructTag(cb.coinType) }));

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
      onSuccess: (data) => {
        console.log("Refreshed app data", data);
      },
      onError: (err) => {
        console.error(err);
        toast.error("Failed to refresh app data. Try changing RPC providers.", {
          description: ((err as Error)?.message || err) as string,
        });
        Sentry.captureException(err);
      },
    },
  );

  return {
    data,
    mutate,
    suilendClient: suilendClientRef.current,
  };
}
