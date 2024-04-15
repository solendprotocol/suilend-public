import { CoinMetadata } from "@mysten/sui.js/client";
import BigNumber from "bignumber.js";

import { Deps } from "./deps";
import { parseRateLimiter } from "./rateLimiter";
import { parseReserve } from "./reserve";

export type ParsedLendingMarket = ReturnType<typeof parseLendingMarket>;

export const parseLendingMarket = (
  {
    LendingMarket,
    Reserve,
    PoolRewardManager,
    PoolReward,
    simulate,
    RateLimiter,
  }: Pick<
    Deps,
    | "LendingMarket"
    | "Reserve"
    | "PoolRewardManager"
    | "PoolReward"
    | "simulate"
    | "RateLimiter"
  >,
  lendingMarket: typeof LendingMarket,
  reserves: (typeof Reserve)[],
  coinMetadataMap: Record<string, CoinMetadata>,
  currentTime: number,
) => {
  const parsedReserves = reserves.map((reserve) =>
    parseReserve(
      { Reserve, PoolRewardManager, PoolReward, simulate },
      reserve,
      coinMetadataMap,
    ),
  );

  const parsedRateLimiter = parseRateLimiter(
    { RateLimiter },
    lendingMarket.rateLimiter,
    currentTime,
  );

  // Custom
  let totalSupplyUsd = new BigNumber(0);
  let totalBorrowUsd = new BigNumber(0);
  let tvlUsd = new BigNumber(0);

  parsedReserves.forEach((properties) => {
    totalSupplyUsd = totalSupplyUsd.plus(
      properties.totalDeposits.times(properties.price),
    );
    totalBorrowUsd = totalBorrowUsd.plus(
      properties.borrowedAmount.times(properties.price),
    );
    tvlUsd = tvlUsd.plus(properties.availableAmount.times(properties.price));
  });

  return {
    reserves: parsedReserves,
    rateLimiter: parsedRateLimiter,

    totalSupplyUsd,
    totalBorrowUsd,
    tvlUsd,
  };
};
