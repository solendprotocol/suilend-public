import { SuiTransactionBlockResponse } from "@mysten/sui.js/client";
import {
  TransactionBlock,
  TransactionObjectArgument,
} from "@mysten/sui.js/transactions";

export type SwapArgs = {
  fromCoinType: string;
  toCoinType: string;
  toAmount?: number;
  fromAmount?: number;
  maxSlippage: number;
  txb: TransactionBlock;
};

export interface Swapper {
  init(): Promise<void>;
  swap(args: SwapArgs): Promise<{
    fromCoin: TransactionObjectArgument;
    toCoin: TransactionObjectArgument;
    txb: TransactionBlock;
  } | null>;
}
