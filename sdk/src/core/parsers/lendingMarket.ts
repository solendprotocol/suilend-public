import { CoinMetadata } from "@mysten/sui/client";
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
  const id = lendingMarket.id;
  const version = lendingMarket.version;

  const parsedReserves = reserves.map((reserve) =>
    parseReserve(
      { Reserve, PoolRewardManager, PoolReward, simulate },
      reserve,
      coinMetadataMap,
    ),
  );

  const obligations = lendingMarket.obligations;

  const parsedRateLimiter = parseRateLimiter(
    { RateLimiter },
    lendingMarket.rateLimiter,
    currentTime,
  );

  const feeReceiver = lendingMarket.feeReceiver;
  const badDebtUsd = new BigNumber(lendingMarket.badDebtUsd.value.toString());
  const badDebtLimitUsd = new BigNumber(
    lendingMarket.badDebtLimitUsd.value.toString(),
  );

  // Custom
  let depositedAmountUsd = new BigNumber(0);
  let borrowedAmountUsd = new BigNumber(0);
  let tvlUsd = new BigNumber(0);

  parsedReserves.forEach((parsedReserve) => {
    depositedAmountUsd = depositedAmountUsd.plus(
      parsedReserve.depositedAmountUsd,
    );
    borrowedAmountUsd = borrowedAmountUsd.plus(parsedReserve.borrowedAmountUsd);
    tvlUsd = tvlUsd.plus(parsedReserve.availableAmountUsd);
  });

  return {
    id,
    version,
    reserves: parsedReserves,
    obligations,
    rateLimiter: parsedRateLimiter,
    feeReceiver,
    badDebtUsd,
    badDebtLimitUsd,

    depositedAmountUsd,
    borrowedAmountUsd,
    tvlUsd,

    // Deprecated
    /**
     * @deprecated since version 1.0.3. Use `depositedAmountUsd` instead.
     */
    totalSupplyUsd: depositedAmountUsd,
    /**
     * @deprecated since version 1.0.3. Use `borrowedAmountUsd` instead.
     */
    totalBorrowUsd: borrowedAmountUsd,
  };
};
