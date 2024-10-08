import {
  BcsType,
  InferBcsType,
  bcs,
  fromB64,
  fromHEX,
  toHEX,
} from "@mysten/bcs";
import { ObjectArg as SuiObjectArg } from "@mysten/sui/bcs";
import { SuiClient } from "@mysten/sui/client";
import { TransactionArgument } from "@mysten/sui/transactions";

export const ID = bcs.struct("ID", {
  bytes: bcs.bytes(32).transform({
    input: (val: string) => fromHEX(val),
    output: (val: Uint8Array) => toHEX(val),
  }),
});

export const UID = bcs.struct("UID", {
  id: ID,
});

export const ObligationOwnerCap = bcs.struct("ObligationOwnerCap", {
  id: UID,
  obligation_id: ID,
});

export const Decimal = bcs.struct("Decimal", {
  value: bcs.u256(),
});

export const Borrow = bcs.struct("Borrow", {
  reserve_id: bcs.u64(),
  borrowed_amount: Decimal,
  cumulative_borrow_rate: Decimal,
  market_value: Decimal,
});

export const Deposit = bcs.struct("Deposit", {
  reserve_id: bcs.u64(),
  deposited_ctoken_amount: bcs.u64(),
  market_value: Decimal,
});

export const Bag = bcs.struct("Bag", {
  id: UID,
  size: bcs.u64(),
});

export const Obligation = bcs.struct("Obligation", {
  id: UID,
  owner: bcs.bytes(32).transform({
    input: (val: string) => fromHEX(val),
    output: (val: Uint8Array) => toHEX(val),
  }),
  deposits: bcs.vector(Deposit),
  borrows: bcs.vector(Borrow),
  balances: Bag,
  deposited_value_usd: Decimal,
  allowed_borrow_value_usd: Decimal,
  unhealthy_borrow_value_usd: Decimal,
  unweighted_borrowed_value_usd: Decimal,
  weighted_borrowed_value_usd: Decimal,
});

export type ObligationType = typeof Obligation.$inferType;
export type ReserveType = typeof Reserve.$inferType;
export type LendingMarketType = typeof LendingMarket.$inferType;

function Option<T>(T: BcsType<T>) {
  return bcs.struct(`Option<${T}>`, {
    vec: bcs.vector(T),
  });
}

export const InterestRateModel = bcs.struct("InterestRateModel", {
  utils: bcs.vector(bcs.u8()),
  aprs: bcs.vector(bcs.u64()),
});

export const ReserveConfig = bcs.struct("ReserveConfig", {
  id: UID,
  open_ltv_pct: bcs.u8(),
  close_ltv_pct: bcs.u8(),
  borrow_weight_bps: bcs.u64(),
  deposit_limit: bcs.u64(),
  borrow_limit: bcs.u64(),
  liquidation_bonus_pct: bcs.u8(),
  borrow_fee_bps: bcs.u64(),
  spread_fee_bps: bcs.u64(),
  liquidation_fee_bps: bcs.u64(),
  interest_rate: InterestRateModel,
});

export const PriceIdentifier = bcs.struct("PriceIdentifier", {
  bytes: bcs.vector(bcs.u8()),
});

export const Reserve = bcs.struct("Reserve", {
  config: Option(ReserveConfig),
  mint_decimals: bcs.u8(),
  price_identifier: PriceIdentifier,
  price: Decimal,
  price_last_update_timestamp_s: bcs.u64(),
  available_amount: bcs.u64(),
  ctoken_supply: bcs.u64(),
  borrowed_amount: Decimal,
  cumulative_borrow_rate: Decimal,
  interest_last_update_timestamp_s: bcs.u64(),
  fees_accumulated: Decimal,
});

export const ObjectBag = bcs.struct("ObjectBag", {
  id: UID,
  size: bcs.u64(),
});

export const LendingMarket = bcs.struct("LendingMarket", {
  id: UID,
  reserves: bcs.vector(Reserve),
  reserve_treasuries: Bag,
  obligations: ObjectBag,
});

export async function load<T>(
  client: SuiClient,
  type: BcsType<T>,
  id: string,
): Promise<InferBcsType<BcsType<T>>> {
  const data = await client.getObject({ id, options: { showBcs: true } });
  if (data.data?.bcs?.dataType !== "moveObject") {
    throw new Error("Error: invalid data type");
  }
  return type.parse(fromB64(data.data.bcs.bcsBytes));
}

export enum Side {
  DEPOSIT = "deposit",
  BORROW = "borrow",
}

export type ObjectId = string;

export type ObjectCallArg = { Object: SuiObjectArg };

export type ObjectArg = string | ObjectCallArg | TransactionArgument;

export interface PhantomReified<P> {
  phantomType: P;
  kind: "PhantomReified";
}

export interface AddReserveArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  priceInfo: ObjectArg;
  config: ObjectArg;
  coinMetadata: ObjectArg;
  clock: ObjectArg;
}

export interface CreateReserveConfigArgs {
  openLtvPct: number | TransactionArgument;
  closeLtvPct: number | TransactionArgument;
  maxCloseLtvPct: number | TransactionArgument;
  borrowWeightBps: bigint | TransactionArgument;
  depositLimit: bigint | TransactionArgument;
  borrowLimit: bigint | TransactionArgument;
  liquidationBonusBps: bigint | TransactionArgument;
  maxLiquidationBonusBps: bigint | TransactionArgument;
  depositLimitUsd: bigint | TransactionArgument;
  borrowLimitUsd: bigint | TransactionArgument;
  borrowFeeBps: bigint | TransactionArgument;
  spreadFeeBps: bigint | TransactionArgument;
  protocolLiquidationFeeBps: bigint | TransactionArgument;
  interestRateUtils: Array<number | TransactionArgument> | TransactionArgument;
  interestRateAprs: Array<bigint | TransactionArgument> | TransactionArgument;
  isolated: boolean | TransactionArgument;
  openAttributedBorrowLimitUsd: bigint | TransactionArgument;
  closeAttributedBorrowLimitUsd: bigint | TransactionArgument;
}

export interface UpdateReserveConfigArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  config: ObjectArg;
}

export interface AddPoolRewardArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
  rewards: ObjectArg;
  startTimeMs: bigint | TransactionArgument;
  endTimeMs: bigint | TransactionArgument;
  clock: ObjectArg;
}

export interface CancelPoolRewardArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
  rewardIndex: bigint | TransactionArgument;
  clock: ObjectArg;
}

export interface ClosePoolRewardArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
  rewardIndex: bigint | TransactionArgument;
  clock: ObjectArg;
}

export interface ClaimRewardsArgs {
  lendingMarket: ObjectArg;
  cap: ObjectArg;
  clock: ObjectArg;
  reserveId: bigint | TransactionArgument;
  rewardIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
}

export interface ClaimRewardsAndDepositArgs {
  lendingMarket: ObjectArg;
  obligationId: string | TransactionArgument;
  clock: ObjectArg;
  rewardReserveId: bigint | TransactionArgument;
  rewardIndex: bigint | TransactionArgument;
  isDepositReward: boolean | TransactionArgument;
  depositReserveId: bigint | TransactionArgument;
}

export interface CreateRateLimiterConfigArgs {
  windowDuration: bigint | TransactionArgument;
  maxOutflow: bigint | TransactionArgument;
}

export interface UpdateRateLimiterConfigArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
  clock: ObjectArg;
  config: ObjectArg;
}

export interface RefreshReservePriceArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  clock: ObjectArg;
  priceInfo: ObjectArg;
}

export interface DepositLiquidityAndMintCtokensArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  clock: ObjectArg;
  deposit: ObjectArg;
}

export interface DepositCtokensIntoObligationArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationOwnerCap: ObjectArg;
  clock: ObjectArg;
  deposit: ObjectArg;
}

export interface WithdrawCtokensArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationOwnerCap: ObjectArg;
  clock: ObjectArg;
  amount: bigint | TransactionArgument;
}

export interface BorrowArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationOwnerCap: ObjectArg;
  clock: ObjectArg;
  amount: bigint | TransactionArgument;
}

export interface RepayArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  obligationId: string | TransactionArgument;
  clock: ObjectArg;
  maxRepayCoins: ObjectArg;
}

export interface LiquidateArgs {
  lendingMarket: ObjectArg;
  obligationId: string | TransactionArgument;
  repayReserveArrayIndex: bigint | TransactionArgument;
  withdrawReserveArrayIndex: bigint | TransactionArgument;
  clock: ObjectArg;
  repayCoins: ObjectArg;
}

export interface MigrateArgs {
  lendingMarketOwnerCap: ObjectArg;
  lendingMarket: ObjectArg;
}

export interface ClaimFeesArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
}

export interface RedeemCtokensAndWithdrawLiquidityArgs {
  lendingMarket: ObjectArg;
  reserveArrayIndex: bigint | TransactionArgument;
  clock: ObjectArg;
  ctokens: ObjectArg;
  rateLimiterExemption: ObjectArg | TransactionArgument | null;
}

// Events
export type ApiInterestUpdateEvent = {
  id: number;
  lendingMarketId: string;
  coinType: string;
  reserveId: string;
  cumulativeBorrowRate: string;
  availableAmount: string;
  borrowedAmount: string;
  unclaimedSpreadFees: string;
  ctokenSupply: string;
  borrowInterestPaid: string;
  spreadFee: string;
  supplyInterestEarned: string;
  borrowInterestPaidUsdEstimate: string;
  protocolFeeUsdEstimate: string;
  supplyInterestEarnedUsdEstimate: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ApiReserveAssetDataEvent = {
  id: number;
  lendingMarketId: string;
  coinType: string;
  reserveId: string;
  availableAmount: string;
  supplyAmount: string;
  borrowedAmount: string;
  availableAmountUsdEstimate: string;
  supplyAmountUsdEstimate: string;
  borrowedAmountUsdEstimate: string;
  borrowApr: string;
  supplyApr: string;
  ctokenSupply: string;
  cumulativeBorrowRate: string;
  price: string;
  smoothedPrice: string;
  priceLastUpdateTimestampS: number;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};
export type DownsampledApiReserveAssetDataEvent = ApiReserveAssetDataEvent & {
  sampletimestamp: number;
};

export type ApiMintEvent = {
  id: number;
  lendingMarketId: string;
  coinType: string;
  reserveId: string;
  liquidityAmount: string;
  ctokenAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ApiRedeemEvent = {
  id: number;
  lendingMarketId: string;
  coinType: string;
  reserveId: string;
  ctokenAmount: string;
  liquidityAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ApiDepositEvent = {
  id: number;
  lendingMarketId: string;
  coinType: string;
  reserveId: string;
  obligationId: string;
  ctokenAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ApiWithdrawEvent = {
  id: number;
  lendingMarketId: string;
  coinType: string;
  reserveId: string;
  obligationId: string;
  ctokenAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ApiBorrowEvent = {
  id: number;
  lendingMarketId: string;
  coinType: string;
  reserveId: string;
  obligationId: string;
  liquidityAmount: string;
  originationFeeAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ApiRepayEvent = {
  id: number;
  lendingMarketId: string;
  coinType: string;
  reserveId: string;
  obligationId: string;
  liquidityAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ApiLiquidateEvent = {
  id: number;
  lendingMarketId: string;
  repayReserveId: string;
  withdrawReserveId: string;
  obligationId: string;
  // repayCoinType: string;
  // withdrawCoinType: string;
  repayAmount: string;
  withdrawAmount: string;
  protocolFeeAmount: string;
  liquidatorBonusAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ApiClaimRewardEvent = {
  id: number;
  lendingMarketId: string;
  reserveId: string;
  obligationId: string;
  isDepositReward: boolean;
  poolRewardId: string;
  coinType: string;
  liquidityAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ApiObligationDataEvent = {
  id: number;
  lendingMarketId: string;
  obligationId: string;
  depositedValueUsd: string;
  allowedBorrowValueUsd: string;
  unhealthyBorrowValueUsd: string;
  superUnhealthyBorrowValueUsd: string;
  unweightedBorrowedValueUsd: string;
  weightedBorrowedValueUsd: string;
  weightedBorrowedValueUpperBoundUsd: string;
  borrowingIsolatedAsset: boolean;
  badDebtUsd: string;
  closable: boolean;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
  /**
   * {
   *  coin_type: TypeName;
   *  reserve_array_index: u64;
   *  deposited_ctoken_amount: u64;
   *  market_value: Decimal;
   *  user_reward_manager_index: u64;
   *  attributed_borrow_value: Decimal;
   * }[]
   */
  depositsJson: string;
  /**
   * {
   *  coin_type: TypeName;
   *  reserve_array_index: u64;
   *  borrowed_amount: Decimal;
   *  cumulative_borrow_rate: Decimal;
   *  market_value: Decimal;
   *  user_reward_manager_index: u64;
   * }[]
   */
  borrowsJson: string;
};
