import BigNumber from "bignumber.js";

import { Deps } from "./deps";

export type ParsedRateLimiter = ReturnType<typeof parseRateLimiter>;
export type ParsedRateLimiterConfig = ReturnType<typeof parseRateLimiterConfig>;

export const parseRateLimiter = (
  { RateLimiter }: Pick<Deps, "RateLimiter">,
  rateLimiter: typeof RateLimiter,
  currentTime: number,
) => {
  const config = parseRateLimiterConfig({ RateLimiter }, rateLimiter);

  const $typeName = rateLimiter.$typeName;
  const prevQty = rateLimiter.prevQty.value;
  const windowStart = rateLimiter.windowStart;
  const curQty = rateLimiter.curQty.value;

  // Custom
  const prevWeight = new BigNumber(config.windowDuration.toString())
    .minus((BigInt(currentTime) - windowStart + BigInt(1)).toString())
    .div(config.windowDuration.toString());
  const currentOutflow = prevWeight
    .times(new BigNumber(prevQty.toString()))
    .plus(new BigNumber(curQty.toString()))
    .div(10 ** 18);

  const remainingOutflow = currentOutflow.gt(config.maxOutflow.toString())
    ? new BigNumber(0)
    : new BigNumber(config.maxOutflow.toString()).minus(currentOutflow);

  return {
    config,

    $typeName,
    prevQty,
    windowStart,
    curQty,

    remainingOutflow,
  };
};

export const parseRateLimiterConfig = (
  { RateLimiter }: Pick<Deps, "RateLimiter">,
  rateLimiter: typeof RateLimiter,
) => {
  const config = rateLimiter.config;
  if (!config) throw new Error("Rate limiter config not found");

  const windowDuration = config.windowDuration;
  const maxOutflow = config.maxOutflow;

  return {
    windowDuration,
    maxOutflow,
  };
};
