import { CoinMetadata } from "@mysten/sui.js/client";
import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";
import { v4 as uuidv4 } from "uuid";

import { WAD } from "../constants";
import { toHexString } from "../utils";

import { Deps } from "./deps";

export type ParsedReserve = ReturnType<typeof parseReserve>;
export type ParsedReserveConfig = ReturnType<typeof parseReserveConfig>;
export type ParsedPoolRewardManager = ReturnType<typeof parsePoolRewardManager>;
export type ParsedPoolReward = NonNullable<ReturnType<typeof parsePoolReward>>;

export const parseReserve = (
  {
    Reserve,
    PoolRewardManager,
    PoolReward,
    simulate,
  }: Pick<Deps, "Reserve" | "PoolRewardManager" | "PoolReward" | "simulate">,
  reserve: typeof Reserve,
  coinMetadataMap: Record<string, CoinMetadata>,
) => {
  const config = parseReserveConfig({ Reserve }, reserve);

  const $typeName = reserve.$typeName;
  const id = reserve.id;
  const arrayIndex = reserve.arrayIndex;
  const coinType = normalizeStructTag(reserve.coinType.name);

  const coinMetadata = coinMetadataMap[coinType];

  const mintDecimals = reserve.mintDecimals;
  const priceIdentifier = `0x${toHexString(reserve.priceIdentifier.bytes)}`;
  const price = new BigNumber(reserve.price.value.toString()).div(
    WAD.toString(),
  );
  const smoothedPrice = new BigNumber(
    reserve.smoothedPrice.value.toString(),
  ).div(WAD.toString());
  const minPrice = BigNumber.min(price, smoothedPrice);
  const maxPrice = BigNumber.max(price, smoothedPrice);
  const priceLastUpdateTimestampS = reserve.priceLastUpdateTimestampS;
  const availableAmount = new BigNumber(reserve.availableAmount.toString()).div(
    10 ** mintDecimals,
  );
  const ctokenSupply = new BigNumber(reserve.ctokenSupply.toString()).div(
    10 ** mintDecimals,
  );
  const borrowedAmount = new BigNumber(reserve.borrowedAmount.value.toString())
    .div(WAD.toString())
    .div(10 ** mintDecimals);
  const cumulativeBorrowRate = new BigNumber(
    reserve.cumulativeBorrowRate.value.toString(),
  ).div(WAD.toString());
  const interestLastUpdateTimestampS = reserve.interestLastUpdateTimestampS;
  const unclaimedSpreadFees = new BigNumber(
    reserve.unclaimedSpreadFees.value.toString(),
  )
    .div(WAD.toString())
    .div(10 ** mintDecimals);
  const attributedBorrowValue = new BigNumber(
    reserve.attributedBorrowValue.value.toString(),
  );
  const depositsPoolRewardManager = parsePoolRewardManager(
    { PoolRewardManager, PoolReward },
    reserve.depositsPoolRewardManager,
    coinMetadataMap,
  );
  const borrowsPoolRewardManager = parsePoolRewardManager(
    { PoolRewardManager, PoolReward },
    reserve.borrowsPoolRewardManager,
    coinMetadataMap,
  );

  // Custom
  const totalDeposits = borrowedAmount
    .plus(availableAmount)
    .minus(unclaimedSpreadFees);

  const cTokenExchangeRate = simulate.cTokenRatio(reserve);

  const borrowAprPercent = simulate.calculateBorrowApr(reserve);
  const depositAprPercent = simulate.calculateSupplyApr(reserve);
  const utilizationPercent = simulate
    .calculateUtilizationRate(reserve)
    .times(100);

  const symbol = coinMetadata.symbol;
  const name = coinMetadata.name;
  const iconUrl = coinMetadata.iconUrl;
  const description = coinMetadata.description;

  return {
    config,

    $typeName,
    id,
    arrayIndex,
    coinType,

    mintDecimals,
    priceIdentifier,
    price,
    smoothedPrice,
    minPrice,
    maxPrice,
    priceLastUpdateTimestampS,
    availableAmount,
    ctokenSupply,
    borrowedAmount,
    cumulativeBorrowRate,
    interestLastUpdateTimestampS,
    unclaimedSpreadFees,
    attributedBorrowValue,
    depositsPoolRewardManager,
    borrowsPoolRewardManager,

    totalDeposits,
    cTokenExchangeRate,
    borrowAprPercent,
    depositAprPercent,
    utilizationPercent,

    symbol,
    name,
    iconUrl,
    description,
  };
};

export const parseReserveConfig = (
  { Reserve }: Pick<Deps, "Reserve">,
  reserve: typeof Reserve,
) => {
  const config = reserve.config.element;
  if (!config) throw new Error("Reserve config not found");

  const mintDecimals = reserve.mintDecimals;

  const $typeName = config.$typeName;
  const openLtvPct = config.openLtvPct;
  const closeLtvPct = config.closeLtvPct;
  const maxCloseLtvPct = config.maxCloseLtvPct;
  const borrowWeightBps = Number(config.borrowWeightBps.toString());
  const depositLimit = new BigNumber(config.depositLimit.toString()).div(
    10 ** mintDecimals,
  );
  const borrowLimit = new BigNumber(config.borrowLimit.toString()).div(
    10 ** mintDecimals,
  );
  const liquidationBonusBps = Number(config.liquidationBonusBps.toString());
  const maxLiquidationBonusBps = Number(
    config.maxLiquidationBonusBps.toString(),
  );
  const depositLimitUsd = new BigNumber(config.depositLimitUsd.toString());
  const borrowLimitUsd = new BigNumber(config.borrowLimitUsd.toString());
  const borrowFeeBps = Number(config.borrowFeeBps.toString());
  const spreadFeeBps = Number(config.spreadFeeBps.toString());
  const protocolLiquidationFeeBps = Number(
    config.protocolLiquidationFeeBps.toString(),
  );
  const isolated = config.isolated;
  const openAttributedBorrowLimitUsd = Number(
    config.openAttributedBorrowLimitUsd.toString(),
  );
  const closeAttributedBorrowLimitUsd = Number(
    config.closeAttributedBorrowLimitUsd.toString(),
  );
  // additionalFields
  const interestRate = (config.interestRateUtils as any[]).map(
    (util, index) => ({
      id: uuidv4(),
      utilPercent: new BigNumber(util.toString()),
      aprPercent: new BigNumber(config.interestRateAprs[index].toString()).div(
        100,
      ),
    }),
  );

  return {
    $typeName,
    openLtvPct,
    closeLtvPct,
    maxCloseLtvPct,
    borrowWeightBps,
    depositLimit,
    borrowLimit,
    liquidationBonusBps,
    maxLiquidationBonusBps,
    depositLimitUsd,
    borrowLimitUsd,
    borrowFeeBps,
    spreadFeeBps,
    protocolLiquidationFeeBps,
    isolated,
    openAttributedBorrowLimitUsd,
    closeAttributedBorrowLimitUsd,
    // additionalFields,
    interestRate,
  };
};

export const parsePoolRewardManager = (
  {
    PoolRewardManager,
    PoolReward,
  }: Pick<Deps, "PoolRewardManager" | "PoolReward">,
  poolRewardManager: typeof PoolRewardManager,
  coinMetadataMap: Record<string, CoinMetadata>,
) => {
  const $typeName = poolRewardManager.$typeName;
  const id = poolRewardManager.id;
  const totalShares = poolRewardManager.totalShares;
  const poolRewards = (poolRewardManager.poolRewards as (typeof PoolReward)[])
    .map((pr, index) =>
      parsePoolReward({ PoolReward }, pr, index, coinMetadataMap),
    )
    .filter(Boolean) as ParsedPoolReward[];

  const lastUpdateTimeMs = poolRewardManager.lastUpdateTimeMs;

  return {
    $typeName,
    id,
    totalShares,
    poolRewards,
    lastUpdateTimeMs,
  };
};

export const parsePoolReward = (
  { PoolReward }: Pick<Deps, "PoolReward">,
  poolReward: typeof PoolReward | null,
  rewardIndex: number,
  coinMetadataMap: Record<string, CoinMetadata>,
) => {
  if (!poolReward) return null;

  const $typeName = poolReward.$typeName;
  const id = poolReward.id;
  const poolRewardManagerId = poolReward.poolRewardManagerId;
  const coinType = normalizeStructTag(poolReward.coinType.name);

  const coinMetadata = coinMetadataMap[coinType];
  const mintDecimals = coinMetadata.decimals;
  const startTimeMs = Number(poolReward.startTimeMs);
  const endTimeMs = Number(poolReward.endTimeMs);
  const totalRewards = new BigNumber(poolReward.totalRewards.toString()).div(
    10 ** coinMetadata.decimals,
  );
  const allocatedRewards = new BigNumber(
    poolReward.allocatedRewards.value.toString(),
  )
    .div(WAD.toString())
    .div(10 ** coinMetadata.decimals);
  const cumulativeRewardsPerShare = new BigNumber(
    poolReward.cumulativeRewardsPerShare.value.toString(),
  )
    .div(WAD.toString())
    .div(10 ** coinMetadata.decimals);
  const numUserRewardManagers = poolReward.numUserRewardManagers;
  // additionalFields

  // Custom
  const symbol = coinMetadata.symbol;

  return {
    $typeName,
    id,
    rewardIndex,
    poolRewardManagerId,
    coinType,
    startTimeMs,
    endTimeMs,
    totalRewards,
    allocatedRewards,
    cumulativeRewardsPerShare,
    numUserRewardManagers,
    mintDecimals,

    symbol,
  };
};
