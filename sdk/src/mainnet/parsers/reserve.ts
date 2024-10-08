import { CoinMetadata } from "@mysten/sui/client";

import * as core from "../../core/parsers/reserve";
import {
  PoolReward,
  PoolRewardManager,
} from "../_generated/suilend/liquidity-mining/structs";
import { Reserve } from "../_generated/suilend/reserve/structs";
import * as simulate from "../utils/simulate";

export type ParsedReserve = ReturnType<typeof parseReserve>;
export type ParsedReserveConfig = ReturnType<typeof parseReserveConfig>;
export type ParsedPoolRewardManager = ReturnType<typeof parsePoolRewardManager>;
export type ParsedPoolReward = NonNullable<ReturnType<typeof parsePoolReward>>;

export const parseReserve = (
  reserve: Reserve<string>,
  coinMetadataMap: Record<string, CoinMetadata>,
) =>
  core.parseReserve(
    { Reserve: Reserve<string>, PoolRewardManager, PoolReward, simulate },
    reserve,
    coinMetadataMap,
  );

export const parseReserveConfig = (reserve: Reserve<string>) =>
  core.parseReserveConfig({ Reserve: Reserve<string> }, reserve);

export const parsePoolRewardManager = (
  poolRewardManager: PoolRewardManager,
  coinMetadataMap: Record<string, CoinMetadata>,
) =>
  core.parsePoolRewardManager(
    { PoolRewardManager, PoolReward },
    poolRewardManager,
    coinMetadataMap,
  );

export const parsePoolReward = (
  poolReward: PoolReward | null,
  rewardIndex: number,
  coinMetadataMap: Record<string, CoinMetadata>,
) =>
  core.parsePoolReward(
    { PoolReward },
    poolReward,
    rewardIndex,
    coinMetadataMap,
  );
