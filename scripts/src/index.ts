import { SuiClient } from "@mysten/sui.js/client";
import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  SuilendClient,
} from "../../sdk/src/mainnet/client";
import { LendingMarket } from "../../sdk/src/mainnet/_generated/suilend/lending-market/structs";
import { fetchAllObligationsForMarket } from "../../sdk/src/mainnet/utils/obligation";
import { phantom } from "../../sdk/src/mainnet/_generated/_framework/reified";
import { Reserve } from "../../sdk/src/mainnet/_generated/suilend/reserve/structs";
import * as simulate from "../../sdk/src/mainnet/utils/simulate";
import { SuiPriceServiceConnection } from "../../pyth-sdk/src";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Side } from "../../sdk/src/core/types";
import { fromB64, fromHEX } from "@mysten/sui.js/utils";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

const REWARD_RESERVE_INDEX = 0;
const REWARD_INDEX = 0;
const REWARD_TYPE = "0x2::sui::SUI";
const DEPOSIT_RESERVE_INDEX = 0;
const IS_DEPOSIT_REWARD = true;

const BATCH_SIZE = 50;

const keypair = Ed25519Keypair.fromSecretKey(
  fromB64(process.env.SUI_SECRET_KEY!),
);

async function main() {
  console.log("hi");
  const client = new SuiClient({
    url: "https://fullnode.mainnet.sui.io/",
  });
  const suilendClient = await SuilendClient.initialize(
    LENDING_MARKET_ID,
    LENDING_MARKET_TYPE,
    client,
  );
  const connection = new SuiPriceServiceConnection(
    "https://hermes.pyth.network",
  );

  const obligations = await fetchAllObligationsForMarket(
    client,
    LENDING_MARKET_ID,
  );
  console.log("Fetched obligations");

  let lendingMarket = await LendingMarket.fetch(
    client,
    phantom(LENDING_MARKET_TYPE),
    LENDING_MARKET_ID,
  );

  const now = Math.floor(Date.now() / 1000);
  let refreshedReserves = lendingMarket.reserves as Reserve<string>[];
  refreshedReserves = await simulate.refreshReservePrice(
    lendingMarket.reserves.map((r) => simulate.compoundReserveInterest(r, now)),
    connection,
  );

  const poolManager = IS_DEPOSIT_REWARD
    ? refreshedReserves[REWARD_RESERVE_INDEX].depositsPoolRewardManager
    : refreshedReserves[REWARD_RESERVE_INDEX].borrowsPoolRewardManager;

  if (!poolManager) {
    throw new Error("Pool manager not found");
  }

  const refreshedObligations = obligations
    .map((o) => {
      return simulate.refreshObligation(o, refreshedReserves);
    })
    .filter((obligation) => {
      let userRewardManager = obligation.userRewardManagers.find(
        (u) => u.poolRewardManagerId == poolManager?.id,
      );

      if (!userRewardManager) {
        return false;
      }

      let userReward = userRewardManager.rewards[REWARD_INDEX];
      return userReward != null;
    });

  console.log("Crankable obligations length: ", refreshedObligations.length);

  console.log(poolManager.id);
  console.log(poolManager);

  let i = 0;
  while (i < refreshedObligations.length) {
    let txb = new TransactionBlock();
    for (let j = 0; j < BATCH_SIZE && i < refreshedObligations.length; j++) {
      let obligation = refreshedObligations[i];

      suilendClient.claimRewardsAndDeposit(
        obligation.id,
        BigInt(REWARD_RESERVE_INDEX),
        BigInt(REWARD_INDEX),
        REWARD_TYPE,
        IS_DEPOSIT_REWARD ? Side.DEPOSIT : Side.BORROW,
        BigInt(DEPOSIT_RESERVE_INDEX),
        txb,
      );

      i++;
    }

    let res = await client.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: keypair,
    });
    console.log(res);
  }

  console.log(lendingMarket);
}

main();
