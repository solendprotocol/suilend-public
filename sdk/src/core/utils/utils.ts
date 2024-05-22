import { SerializedBcs, isSerializedBcs } from "@mysten/bcs";
import { SharedObjectRef, isPureArg } from "@mysten/sui.js/bcs";
import { SuiObjectRef } from "@mysten/sui.js/client";
import {
  Inputs,
  TransactionArgument,
  TransactionBlock,
  TransactionObjectArgument,
} from "@mysten/sui.js/transactions";
import { isValidSuiObjectId, normalizeSuiObjectId } from "@mysten/sui.js/utils";
//import { ObjectCallArg, PureCallArg } from "@mysten/sui.js/transactions";

/**
 * These are the basics types that can be used in SUI
 */
export type SuiBasicTypes =
  | "address"
  | "bool"
  | "u8"
  | "u16"
  | "u32"
  | "u64"
  | "u128"
  | "u256"
  | "signer";

export type SuiAddressArg = TransactionArgument | SerializedBcs<any> | string;
//| PureCallArg; // No longer exists?

export type SuiTxArg = SuiAddressArg | number | bigint | boolean;

export type SuiInputTypes = "object" | SuiBasicTypes;

export type SuiObjectArg =
  | TransactionObjectArgument
  | string
  | SharedObjectRef
  | SuiObjectRef;
// | ObjectCallArg; // No longer exists?

export type SuiVecTxArg =
  | { value: SuiTxArg[]; vecType: SuiInputTypes }
  | SuiTxArg[];

export function takeAmountFromCoins(
  txBlock: TransactionBlock,
  coins: SuiObjectArg[],
  amount: SuiTxArg,
) {
  const coinObjects = coins.map((coin) => convertObjArg(txBlock, coin));
  const mergedCoin = coinObjects[0];
  if (coins.length > 1) {
    txBlock.mergeCoins(mergedCoin, coinObjects.slice(1));
  }
  const [sendCoin] = txBlock.splitCoins(
    mergedCoin,
    convertArgs(txBlock, [amount]) as any,
  );
  return [sendCoin, mergedCoin];
}

export function splitSUIFromGas(
  txBlock: TransactionBlock,
  amounts: SuiTxArg[],
) {
  return txBlock.splitCoins(txBlock.gas, convertArgs(txBlock, amounts) as any);
}

/**
 * Convert any valid input into array of TransactionArgument.
 *
 * @param txb The Transaction Block
 * @param args The array of argument to convert.
 * @returns The converted array of TransactionArgument.
 */
export function convertArgs(
  txBlock: TransactionBlock,
  args: (SuiTxArg | SuiVecTxArg)[],
) {
  return args.map((arg) => {
    if (typeof arg === "string" && isValidSuiObjectId(arg)) {
      return txBlock.object(normalizeSuiObjectId(arg));
    } else if (
      typeof arg == "object" &&
      !isSerializedBcs(arg) &&
      !isPureArg(arg) &&
      !isMoveVecArg(arg)
    ) {
      return convertObjArg(txBlock, arg as SuiObjectArg);
    } else if (isMoveVecArg(arg)) {
      const vecType = "vecType" in arg;
      return vecType
        ? makeVecParam(txBlock, arg.value, arg.vecType)
        : makeVecParam(txBlock, arg);
    } else if (isSerializedBcs(arg)) {
      return arg;
    } else {
      return txBlock.pure(arg);
    }
  });
}

/**
 * Convert any valid object input into a TransactionArgument.
 *
 * @param txb The Transaction Block
 * @param arg The object argument to convert.
 * @returns The converted TransactionArgument.
 */
export function convertObjArg(
  txb: TransactionBlock,
  arg: SuiObjectArg,
): TransactionObjectArgument {
  if (typeof arg === "string") {
    return txb.object(arg);
  }

  if ("digest" in arg && "version" in arg && "objectId" in arg) {
    return txb.objectRef(arg);
  }

  if ("objectId" in arg && "initialSharedVersion" in arg && "mutable" in arg) {
    return txb.sharedObjectRef(arg);
  }

  if ("Object" in arg) {
    if ("ImmOrOwned" in (arg.Object as any)) {
      return txb.object(Inputs.ObjectRef((arg.Object as any).ImmOrOwned));
    } else if ("Shared" in (arg.Object as any)) {
      return txb.object(Inputs.SharedObjectRef((arg.Object as any).Shared));
    } else {
      throw new Error("Invalid argument type");
    }
  }

  if ("kind" in arg) {
    return arg;
  }

  throw new Error("Invalid argument type");
}
/**
 * Check whether it is an valid move vec input.
 *
 * @param arg The argument to check.
 * @returns boolean.
 */
export function isMoveVecArg(arg: SuiTxArg | SuiVecTxArg): arg is SuiVecTxArg {
  if (typeof arg === "object" && "vecType" in arg && "value" in arg) {
    return true;
  } else if (Array.isArray(arg)) {
    return true;
  }
  return false;
}

export const getDefaultSuiInputType = (
  value: SuiTxArg,
): SuiInputTypes | undefined => {
  if (typeof value === "string" && isValidSuiObjectId(value)) {
    return "object";
  } else if (typeof value === "number" || typeof value === "bigint") {
    return "u64";
  } else if (typeof value === "boolean") {
    return "bool";
  } else {
    return undefined;
  }
};

/**
 * Since we know the elements in the array are the same type
 * If type is not provided, we will try to infer the type from the first element
 * By default,
 *
 * string is hex and its length equal to 32 =====> object id
 * number, bigint ====> u64
 * boolean =====> bool
 *
 * If type is provided, we will use the type to convert the array
 * @param args
 * @param type 'address' | 'bool' | 'u8' | 'u16' | 'u32' | 'u64' | 'u128' | 'u256' | 'signer' | 'object' | string
 */
export function makeVecParam(
  txBlock: TransactionBlock,
  args: SuiTxArg[],
  type?: SuiInputTypes,
): TransactionArgument {
  if (args.length === 0)
    throw new Error("Transaction builder error: Empty array is not allowed");
  // Using first element value as default type
  const defaultSuiType = getDefaultSuiInputType(args[0]);
  const VECTOR_REGEX = /^vector<(.+)>$/;
  const STRUCT_REGEX = /^([^:]+)::([^:]+)::([^<]+)(<(.+)>)?/;

  type = type || defaultSuiType;

  if (type === "object") {
    const objects = args.map((arg) =>
      typeof arg === "string" && isValidSuiObjectId(arg)
        ? txBlock.object(normalizeSuiObjectId(arg))
        : convertObjArg(txBlock, arg as SuiObjectArg),
    );
    return txBlock.makeMoveVec({ objects });
  } else if (
    typeof type === "string" &&
    !VECTOR_REGEX.test(type) &&
    !STRUCT_REGEX.test(type)
  ) {
    return txBlock.pure(args, `vector<${type}>`);
  } else {
    const objects = args.map((arg) =>
      convertObjArg(txBlock, arg as SuiObjectArg),
    );
    return txBlock.makeMoveVec({ objects, type });
  }
}
