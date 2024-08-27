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
import { Obligation } from "../../sdk/src/mainnet/_generated/suilend/obligation/structs";

const REWARD_TYPE = "0x2::sui::SUI";
const DEPOSIT_RESERVE_INDEX = 0;
const IS_DEPOSIT_REWARD = true;

const BATCH_SIZE = 50;

const keypair = Ed25519Keypair.fromSecretKey(
  fromB64(process.env.SUI_SECRET_KEY!)
);

async function main() {
  const client = new SuiClient({
    url: `https://solendf-suishar-0c55.mainnet.sui.rpcpool.com/${
      process.env.NEXT_PUBLIC_SUI_TRITON_ONE_DEV_API_KEY ?? ""
    }`
  });
  console.log("Starting...");

  // start timing
  const start = Date.now();
  const obligations = await fetchAllObligationsForMarket(
    client,
    LENDING_MARKET_ID
  );
  // end timing
  const end = Date.now();
  console.log("Time taken in seconds: ", (end - start) / 1000);
  console.log("Fetched obligations with length: ", obligations.length);

  // Filter obligations that have borrows
  const obligationsWithBorrows = obligations.filter(obligation => {
    // Check if the obligation has any borrows
    return obligation.borrows.length > 0;
  });

  console.log("Obligations with borrows:", obligationsWithBorrows.length);

  const suilendClient = await SuilendClient.initialize(
    LENDING_MARKET_ID,
    LENDING_MARKET_TYPE,
    client
  );

  // Get coins owned by the keypair
  let coinTypeToCoinAddress = new Map<string, string>();
  coinTypeToCoinAddress.set("5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN", "0xea534aeaa4313a2b7a79b6150265f5a9b3f9df9e26bc08ec7c34e401c34bd0be");
  coinTypeToCoinAddress.set("c060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN", "0x7c1833a89812eeb7419e34562b55c231e113f1c7195cbc784409ac7e6155bc8c");
  // set for sui
  coinTypeToCoinAddress.set("0000000000000000000000000000000000000000000000000000000000000002::sui::SUI", "0x00dc194382e75ee6d880cbd2198fc440c4db8aaad42fac495833367d13d2d9f9");
  coinTypeToCoinAddress.set("af8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN", "0xdc93044e988b614e3e911f54484662d0c7f307368ddcbfc2af591789c3c2f386");
  coinTypeToCoinAddress.set("b7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8::coin::COIN", "0xf14269d2c453a1424f26f6130edc7b953e21a2490bf162d1650345b966aac9b9");




  let txb = new TransactionBlock();
  let count = 0;


  for (const obligation of obligationsWithBorrows) {
    if (obligation.borrows.length > 0) {
      const firstBorrow = obligation.borrows.find(borrow => borrow.borrowedAmount.value > 0);
      if (!firstBorrow) {
        console.log("No borrow found for obligation: ", obligation.borrows);
        console.log("Obligation: ", obligation.id);
        continue;
      }

      const coinType = firstBorrow.coinType.name;

      const coinAddress = coinTypeToCoinAddress.get(coinType);
      const [repayCoin] = txb.splitCoins(txb.object(coinAddress), [1]);

      suilendClient.repay(
        obligation.id,
        coinType,
        repayCoin,
        txb
      );

      // txb.transferObjects([repayCoin], keypair.toSuiAddress());
      txb.moveCall({
        target: "0x2::coin::destroy_zero",
        arguments: [repayCoin],
        typeArguments: [coinType]
      });

      count++;

      if (count == 100) {
        // get gas coin
        const gasCoins = await client.getOwnedObjects({
          owner: keypair.toSuiAddress(),
          filter: {
            StructType: "0x2::coin::Coin<0x2::sui::SUI>"
          }
        });
        // filter for address 0x746f11ff6c9959b5415c146e9d0a150eff8e35f325b52aa24caa3803ed71c170
        // console.log("Gas coins: ", gasCoins.data);
        const gasCoin = gasCoins.data.find(coin => coin.data.objectId == "0xa522d4c8bea33313ad4d91b6b69b04bf1ed8fe9db28f5bbac8f07a7e5eb6d70e");
        txb.setGasPayment([gasCoin.data]);
        const result = await client.signAndExecuteTransactionBlock({
          transactionBlock: txb,
          signer: keypair,
          options: {
            showEffects: true,
          },
        });

        console.log("Transaction digest:", result.digest);
        // sleep for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        count = 0;
        txb = new TransactionBlock();
      }
    }
  }

  console.log("Repayment process completed.");
}

main();
