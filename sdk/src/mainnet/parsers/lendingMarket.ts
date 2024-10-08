import { CoinMetadata } from "@mysten/sui/client";

import * as core from "../../core/parsers/lendingMarket";
import { LendingMarket } from "../_generated/suilend/lending-market/structs";
import {
  PoolReward,
  PoolRewardManager,
} from "../_generated/suilend/liquidity-mining/structs";
import { RateLimiter } from "../_generated/suilend/rate-limiter/structs";
import { Reserve } from "../_generated/suilend/reserve/structs";
import * as simulate from "../utils/simulate";

export type ParsedLendingMarket = ReturnType<typeof parseLendingMarket>;

export const parseLendingMarket = (
  lendingMarket: LendingMarket<string>,
  reserves: Reserve<string>[],
  coinMetadataMap: Record<string, CoinMetadata>,
  currentTime: number,
) =>
  core.parseLendingMarket(
    {
      LendingMarket: LendingMarket<string>,
      Reserve: Reserve<string>,
      PoolRewardManager,
      PoolReward,
      simulate,
      RateLimiter,
    },
    lendingMarket,
    reserves,
    coinMetadataMap,
    currentTime,
  );
