import { extractStructTagFromType } from "@cetusprotocol/cetus-sui-clmm-sdk";
import {
  SuiClient,
  SuiObjectResponse,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui.js/keypairs/secp256k1";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { fromB64, normalizeStructTag } from "@mysten/sui.js/utils";
import { phantom } from "@suilend/sdk/_generated/_framework/reified";
import { LendingMarket } from "@suilend/sdk/_generated/suilend/lending-market/structs";
import BN from "bn.js";

import { COIN_TYPES } from "./constants";

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseLendingMarket(lendingMarketData: SuiObjectResponse) {
  if (lendingMarketData.data?.bcs?.dataType !== "moveObject") {
    throw new Error("Error: invalid data type");
  }
  if (lendingMarketData.data?.bcs?.type == null) {
    throw new Error("Error: lending market type not found");
  }

  const outerType = lendingMarketData.data?.bcs?.type;
  const lendingMarketType = outerType.substring(
    outerType.indexOf("<") + 1,
    outerType.indexOf(">"),
  );
  return LendingMarket.fromBcs(
    phantom(lendingMarketType),
    fromB64(lendingMarketData.data.bcs.bcsBytes),
  );
}

export async function mergeAllCoins(
  client: SuiClient,
  keypair: Ed25519Keypair | Secp256k1Keypair,
  options?: {
    waitForCommitment?: boolean;
  },
): Promise<SuiTransactionBlockResponse | null> {
  const holdings = await getWalletHoldings(client, keypair);
  const coinTypeToHoldings: {
    [key: string]: {
      coinType: string;
      coinObjectId: string;
      balance: BN;
      decimals: number;
      name: string;
      symbol: string;
    }[];
  } = {};
  for (const holding of holdings) {
    if (!coinTypeToHoldings[holding.coinType]) {
      coinTypeToHoldings[holding.coinType] = [];
    }
    coinTypeToHoldings[holding.coinType].push(holding);
  }
  const txb = new TransactionBlock();
  let shouldMerge = false;
  for (const coinType of Object.keys(coinTypeToHoldings)) {
    const holdings = coinTypeToHoldings[coinType];
    if (holdings.length === 1) {
      continue;
    }
    if (coinType === COIN_TYPES.SUI) {
      continue;
    }
    shouldMerge = true;
    txb.mergeCoins(
      holdings[0].coinObjectId,
      holdings.slice(1).map((x) => x.coinObjectId),
    );
  }
  if (shouldMerge) {
    const txBlock = await client.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: keypair,
    });
    if (options?.waitForCommitment) {
      const result = await client.waitForTransactionBlock({
        digest: txBlock.digest,
        timeout: 30,
      });
      if (!result?.digest) {
        throw new Error("Unable to confirm merging coins was successful");
      }
    }
    return txBlock;
  }
  return null;
}

export async function getWalletHoldings(
  client: SuiClient,
  keypair: Ed25519Keypair | Secp256k1Keypair,
  includeZeroBalance?: boolean,
): Promise<
  {
    coinType: string;
    coinObjectId: string;
    balance: BN;
    decimals: number;
    name: string;
    symbol: string;
  }[]
> {
  let cursor: string | null | undefined = null;
  const allCoins: any[] = [];
  while (true) {
    const allCoinsPage = await client.getAllCoins({
      owner: keypair.toSuiAddress(),
      cursor: cursor,
      limit: 100,
    });
    for (const coin of allCoinsPage.data) {
      const coinMetadata = await client.getCoinMetadata({
        coinType: coin.coinType,
      });
      if (new BN(coin.balance).gt(new BN(0)) || includeZeroBalance) {
        allCoins.push({
          coinType: coin.coinType,
          coinAddress: extractStructTagFromType(coin.coinType),
          coinObjectId: coin.coinObjectId,
          balance: new BN(coin.balance),
          decimals: coinMetadata?.decimals,
          name: coinMetadata?.name,
          symbol: coinMetadata?.symbol,
        });
      }
    }
    cursor = allCoinsPage.nextCursor;
    if (!allCoinsPage.hasNextPage) {
      return allCoins;
    }
  }
}

export async function getLendingMarket(
  client: SuiClient,
  lendingMarketId: string,
) {
  const rawLendingMarket = await client.getObject({
    id: lendingMarketId,
    options: {
      showType: true,
      showContent: true,
      showOwner: true,
      showBcs: true,
    },
  });
  return parseLendingMarket(rawLendingMarket);
}

export function isSui(coinType: string): boolean {
  return normalizeStructTag(coinType) == normalizeStructTag(COIN_TYPES.SUI);
}
