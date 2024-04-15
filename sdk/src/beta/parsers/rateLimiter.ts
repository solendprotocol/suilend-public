import * as core from "../../core/parsers/rateLimiter";
import { RateLimiter } from "../_generated/suilend/rate-limiter/structs";

export type ParsedRateLimiter = ReturnType<typeof parseRateLimiter>;
export type ParsedRateLimiterConfig = ReturnType<typeof parseRateLimiterConfig>;

export const parseRateLimiter = (
  rateLimiter: RateLimiter,
  currentTime: number,
) => core.parseRateLimiter({ RateLimiter }, rateLimiter, currentTime);

export const parseRateLimiterConfig = (rateLimiter: RateLimiter) =>
  core.parseRateLimiterConfig({ RateLimiter }, rateLimiter);
