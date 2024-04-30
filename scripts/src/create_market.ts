import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";
import {
  SuilendClient,
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE
} from "../../sdk/src/beta/client";
import { Obligation } from "@suilend/sdk/_generated/suilend/obligation/structs";
import { fromHEX, fromB64 } from "@mysten/bcs";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { phantom } from "@suilend/sdk/_generated/_framework/reified";
import {Side} from "../../sdk/src/core/types";

const keypair = Ed25519Keypair.fromSecretKey(
  fromB64(process.env.SUI_SECRET_KEY!),
);

async function createLendingMarket() {
  const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io:443" });

  const txb = new TransactionBlock();
  const ownerCap = await SuilendClient.createNewLendingMarket(
    "0xddb6304a726ff1da7d8b5240c35a5f4d1c43f289258d440ba42044a4ed6c7dc6", 
    "0x2::sui::SUI",
    txb
  );
  txb.transferObjects([ownerCap], keypair.toSuiAddress());
  console.log(
    await client.signAndExecuteTransactionBlock({
      transactionBlock: txb,
      signer: keypair,
    }),
  );
}

async function claimRewards() {
  const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io:443" });

  const txb = new TransactionBlock();
  let suilendClient = await SuilendClient.initialize(LENDING_MARKET_ID, LENDING_MARKET_TYPE, client);

  let [coin] = suilendClient.claimReward(
    "0x389c366935d4b98cf3cebd21236565bf3e41b10eddcab2e0ebcb3e1b32cba5ea", 
    BigInt(0), 
    BigInt(0), 
    "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN", 
    Side.DEPOSIT, 
    txb
  );
  txb.transferObjects([coin], keypair.toSuiAddress());

  console.log(await client.signAndExecuteTransactionBlock({
    transactionBlock: txb,
    signer: keypair,
  }));

}

// createLendingMarket();
claimRewards()
