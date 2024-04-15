import { DynamicFieldInfo, SuiClient } from "@mysten/sui.js/client";
import { fromB64 } from "@mysten/sui.js/utils";
import pLimit from "p-limit";

import { phantom } from "../_generated/_framework/reified";
import { Obligation } from "../_generated/suilend/obligation/structs";
import { LENDING_MARKET_TYPE } from "../client";

export async function fetchAllObligationsForMarketWithHandler(
  client: SuiClient,
  marketAddress: string,
  chunkHandler: (obligations: Obligation<string>[]) => Promise<void>,
) {
  const limit = pLimit(30);
  const rawLendingMarket = await client.getObject({
    id: marketAddress,
    options: {
      showType: true,
      showContent: true,
      showOwner: true,
      showBcs: true,
    },
  });
  const obligationField = (rawLendingMarket.data?.content as any).fields
    .obligations;
  const obligationOwnerID = obligationField.fields.id.id;
  let hasNextPage = true;
  let cursor: string | undefined | null = null;

  const promises = [];
  while (hasNextPage) {
    const response = await client.getDynamicFields({
      parentId: obligationOwnerID,
      cursor: cursor,
    });
    hasNextPage = response.hasNextPage;
    cursor = response.nextCursor;

    promises.push(
      limit(async () => {
        const obligationObjects = await chunkedMultiGet(
          client,
          response.data.map((x) => x.objectId),
        );
        const obligations: Obligation<string>[] = [];
        for (const rawObligation of obligationObjects) {
          obligations.push(
            Obligation.fromBcs(
              phantom(LENDING_MARKET_TYPE),
              fromB64((rawObligation.data?.bcs as any).bcsBytes),
            ),
          );
        }
        await chunkHandler(obligations);
      }),
    );
  }
  await Promise.all(promises);
}

export async function fetchAllObligationsForMarket(
  client: SuiClient,
  marketAddress: string,
) {
  const rawLendingMarket = await client.getObject({
    id: marketAddress,
    options: {
      showType: true,
      showContent: true,
      showOwner: true,
      showBcs: true,
    },
  });
  const obligationField = (rawLendingMarket.data?.content as any).fields
    .obligations;
  const obligationOwnerID = obligationField.fields.id.id;
  let hasNextPage = true;
  let cursor: string | undefined | null = null;
  let fields: DynamicFieldInfo[] = [];
  while (hasNextPage) {
    const response = await client.getDynamicFields({
      parentId: obligationOwnerID,
      cursor: cursor,
    });
    fields = fields.concat(response.data);
    hasNextPage = response.hasNextPage;
    cursor = response.nextCursor;
  }
  const obligationObjects = await chunkedMultiGet(
    client,
    fields.map((x) => x.objectId),
  );
  const obligations: Obligation<string>[] = [];
  for (const rawObligation of obligationObjects) {
    obligations.push(
      Obligation.fromBcs(
        phantom(LENDING_MARKET_TYPE),
        fromB64((rawObligation.data?.bcs as any).bcsBytes),
      ),
    );
  }
  return obligations;
}

async function chunkedMultiGet(client: SuiClient, objectIds: string[]) {
  const limit = pLimit(30);
  const results = [];
  const chunks = splitIntoChunks(objectIds, 50);
  const promises = [];
  for (const chunk of chunks) {
    promises.push(
      limit(() =>
        client.multiGetObjects({
          ids: chunk,
          options: {
            showType: true,
            showContent: true,
            showOwner: true,
            showBcs: true,
          },
        }),
      ),
    );
  }
  for (const chunk of await Promise.all(promises)) {
    for (const result of chunk) {
      results.push(result);
    }
  }
  return results;
}

function splitIntoChunks(arr: string[], chunkSize: number): string[][] {
  const result: string[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}
