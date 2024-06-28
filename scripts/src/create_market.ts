import { fromB64 } from "@mysten/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

import {
  SuilendClient,
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE
} from "../../sdk/src/beta/client";
import {Side} from "../../sdk/src/core/types";

const keypair = Ed25519Keypair.fromSecretKey(
  fromB64(process.env.SUI_SECRET_KEY!),
);

async function createLendingMarket() {
  const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io:443" });

  const tx = new Transaction();
  const ownerCap = await SuilendClient.createNewLendingMarket(
    "0xddb6304a726ff1da7d8b5240c35a5f4d1c43f289258d440ba42044a4ed6c7dc6", 
    "0x2::sui::SUI",
    tx
  );
  tx.transferObjects([ownerCap], keypair.toSuiAddress());
  console.log(
    await client.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
    }),
  );
}

async function claimRewards() {
  const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io:443" });

  const tx = new Transaction();
  let suilendClient = await SuilendClient.initialize(LENDING_MARKET_ID, LENDING_MARKET_TYPE, client);

  let [coin] = suilendClient.claimReward(
    "0x389c366935d4b98cf3cebd21236565bf3e41b10eddcab2e0ebcb3e1b32cba5ea", 
    BigInt(0), 
    BigInt(1), 
    "0x34fe4f3c9e450fed4d0a3c587ed842eec5313c30c3cc3c0841247c49425e246b::suilend_point::SUILEND_POINT", 
    Side.DEPOSIT, 
    tx
  );
  tx.transferObjects([coin], keypair.toSuiAddress());

  console.log(await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  }));

}

// createLendingMarket();
claimRewards()
