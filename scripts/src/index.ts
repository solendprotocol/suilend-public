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
import { SuiPriceServiceConnection } from "../../pyth-sdk/src/SuiPriceServiceConnection";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Side } from "../../sdk/src/core/types";
import { fromB64, fromHEX } from "@mysten/sui.js/utils";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Obligation } from "../../sdk/src/mainnet/_generated/suilend/obligation/structs";

const REWARD_TYPE = "0x2::sui::SUI";
const DEPOSIT_RESERVE_INDEX = 0;
const IS_DEPOSIT_REWARD = true;

const BATCH_SIZE = 50;

const keypair = Ed25519Keypair.fromSecretKey(
  fromB64(process.env.SUI_SECRET_KEY!)
);

async function crankRewards(
  client: SuiClient,
  obligations: Obligation<string>[],
  rewardReserveIndex: number,
  rewardIndex: number
) {
  const suilendClient = await SuilendClient.initialize(
    LENDING_MARKET_ID,
    LENDING_MARKET_TYPE,
    client
  );
  const connection = new SuiPriceServiceConnection(
    "https://hermes.pyth.network"
  );

  let lendingMarket = await LendingMarket.fetch(
    client,
    phantom(LENDING_MARKET_TYPE),
    LENDING_MARKET_ID
  );

  const now = Math.floor(Date.now() / 1000);
  let refreshedReserves = lendingMarket.reserves as Reserve<string>[];
  refreshedReserves = await simulate.refreshReservePrice(
    lendingMarket.reserves.map((r) => simulate.compoundReserveInterest(r, now)),
    connection
  );

  const poolManager = IS_DEPOSIT_REWARD
    ? refreshedReserves[rewardReserveIndex].depositsPoolRewardManager
    : refreshedReserves[rewardReserveIndex].borrowsPoolRewardManager;

  if (!poolManager) {
    throw new Error("Pool manager not found");
  }

  const poolReward = poolManager?.poolRewards[rewardIndex];
  if (poolReward == null) {
    console.log("Pool reward is empty");
    return;
  }

  // const a = poolReward.endTimeMs;
  const endTimeMs = poolReward?.endTimeMs;

  // console.log("Pool reward: ", poolReward);
  if (Date.now() < endTimeMs) {
    console.log("Pool reward not ready");
    return;
  }

  const refreshedObligations = obligations
    .map((o) => {
      return simulate.refreshObligation(o, refreshedReserves);
    })
    .filter((obligation) => {
      let userRewardManager = obligation.userRewardManagers.find(
        (u) => u.poolRewardManagerId == poolManager?.id
      );

      if (!userRewardManager) {
        return false;
      }

      let userReward = userRewardManager.rewards[rewardIndex];
      return userReward != null;
    });

  console.log("Crankable obligations length: ", refreshedObligations.length);

  // console.log(poolManager.id);
  if(poolReward?.coinType.name == '34fe4f3c9e450fed4d0a3c587ed842eec5313c30c3cc3c0841247c49425e246b::suilend_point::SUILEND_POINT') {
    console.log('Skipping SUILEND_POINT rewards');
    return;
  }

  console.log(poolReward.coinType.name);

  let i = 0;
  while (i < refreshedObligations.length) {
    let txb = new TransactionBlock();
    for (let j = 0; j < BATCH_SIZE && i < refreshedObligations.length; j++) {
      let obligation = refreshedObligations[i];

      suilendClient.claimRewardsAndDeposit(
        obligation.id,
        BigInt(rewardReserveIndex),
        BigInt(rewardIndex),
        REWARD_TYPE,
        IS_DEPOSIT_REWARD ? Side.DEPOSIT : Side.BORROW,
        BigInt(DEPOSIT_RESERVE_INDEX),
        txb
      );

      i++;
    }

    let res = await client.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: keypair,
    });
    console.log(res);

    // sleep for 50ms
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function mergeAllSuiCoins() {
  const client = new SuiClient({
    url: `https://solendf-suishar-0c55.mainnet.sui.rpcpool.com/${
      process.env.NEXT_PUBLIC_SUI_TRITON_ONE_DEV_API_KEY ?? ""
    }`
  });

  const coins = await client.getCoins({
    owner: keypair.getPublicKey().toSuiAddress(),
    coinType: "0x2::sui::SUI",
    limit: 1000,
  });

  const gasCoinId = "0x00dc194382e75ee6d880cbd2198fc440c4db8aaad42fac495833367d13d2d9f9";
  const gasCoin = coins.data.find((coin) => coin.coinObjectId == gasCoinId);

  const suiCoins = coins.data.filter((coin) => coin.coinObjectId != gasCoinId);
  const firstCoin = suiCoins[0].coinObjectId;
  const remainingCoinIds = suiCoins.slice(1).map((coin) => coin.coinObjectId);

  let txb = new TransactionBlock();
  txb.setGasPayment([{
    objectId: gasCoinId,
    digest: gasCoin.digest,
    version: gasCoin.version,
  }]);

  txb.mergeCoins(firstCoin, remainingCoinIds);

  const res = await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: keypair,
  });

  console.log(res);
}

async function main() {
  const client = new SuiClient({
    url: `https://solendf-suishar-0c55.mainnet.sui.rpcpool.com/${
      process.env.NEXT_PUBLIC_SUI_TRITON_ONE_DEV_API_KEY ?? ""
    }`
  });

  const obligations = await fetchAllObligationsForMarket(
    client,
    LENDING_MARKET_ID
  );
  console.log("Fetched obligations");

  for (
    let rewardReserveIndex = 0;
    rewardReserveIndex < 3;
    rewardReserveIndex++
  ) {
    for (let rewardIndex = 0; rewardIndex < 30; rewardIndex++) {
        try {
          console.log(
            `Cranking rewards for reserve ${rewardReserveIndex} and reward ${rewardIndex}`
          );
          await crankRewards(
            client,
            obligations,
            rewardReserveIndex,
            rewardIndex
          );
        } catch (e) {
          console.error(e);
        }
      }
  }
}

main();
// mergeAllSuiCoins();
