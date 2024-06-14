import { CoinMetadata, SuiClient } from "@mysten/sui.js/client";

import {
  LOGO_MAP,
  NORMALIZED_SUILEND_POINTS_COINTYPE,
  NORMALIZED_WETH_COINTYPE,
  extractSymbolFromCoinType,
} from "@/lib/coinType";

export const getCoinMetadataMap = async (
  suiClient: SuiClient,
  uniqueCoinTypes: string[], // Assumed already normalized
) => {
  const coinMetadata = await Promise.all(
    uniqueCoinTypes.map((ct) => suiClient.getCoinMetadata({ coinType: ct })),
  );

  const coinMetadataMap: Record<string, CoinMetadata> = {};
  for (let i = 0; i < uniqueCoinTypes.length; i++) {
    const metadata = coinMetadata[i];
    if (!metadata) continue;

    const symbolMap: Record<string, string> = {
      [NORMALIZED_WETH_COINTYPE]: "ETH",
      [NORMALIZED_SUILEND_POINTS_COINTYPE]: "Suilend Points",
    };
    const coinType = uniqueCoinTypes[i];
    const symbol =
      symbolMap[coinType] ??
      metadata?.symbol ??
      extractSymbolFromCoinType(coinType);
    const name = metadata?.name ?? symbol;
    const iconUrl = LOGO_MAP[coinType] ?? metadata?.iconUrl;

    coinMetadataMap[coinType] = {
      ...metadata,
      symbol,
      name,
      iconUrl,
    };
  }

  return coinMetadataMap;
};
