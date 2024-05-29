import BigNumber from "bignumber.js";

import { ParsedDownsampledApiReserveAssetDataEvent } from "@suilend/sdk/parsers/apiReserveAssetDataEvent";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import {
  NORMALIZED_SUI_COINTYPE,
  NORMALIZED_USDC_ET_COINTYPE,
  NORMALIZED_USDT_ET_COINTYPE,
  isSui,
} from "@/lib/coinType";
import { msPerYear } from "@/lib/constants";

export enum EventType {
  INTEREST_UPDATE = "interestUpdate",
  RESERVE_ASSET_DATA = "reserveAssetData",
  MINT = "mint",
  REDEEM = "redeem",
  DEPOSIT = "deposit",
  BORROW = "borrow",
  WITHDRAW = "withdraw",
  REPAY = "repay",
  LIQUIDATE = "liquidate",
  CLAIM_REWARD = "claimReward",
  OBLIGATION_DATA = "obligationData",
}

export const EventTypeNameMap: Record<EventType, string> = {
  [EventType.INTEREST_UPDATE]: "Interest update",
  [EventType.RESERVE_ASSET_DATA]: "Reserve asset data",
  [EventType.MINT]: "Mint",
  [EventType.REDEEM]: "Redeem",
  [EventType.DEPOSIT]: "Deposit",
  [EventType.BORROW]: "Borrow",
  [EventType.WITHDRAW]: "Withdraw",
  [EventType.REPAY]: "Repay",
  [EventType.LIQUIDATE]: "Liquidation",
  [EventType.CLAIM_REWARD]: "Claim rewards",
  [EventType.OBLIGATION_DATA]: "Obligation data",
};

type EventRow = {
  timestamp: number;
  eventIndex: number;
};

export const apiEventSortDesc = (a: EventRow, b: EventRow) => {
  const aDate = new Date(a.timestamp * 1000).getTime();
  const bDate = new Date(b.timestamp * 1000).getTime();
  if (aDate !== bDate) return bDate - aDate;

  return b.eventIndex - a.eventIndex;
};

export const eventSortAsc = (a: EventRow, b: EventRow) =>
  -1 * apiEventSortDesc(a, b);

// DownsampledApiReserveAssetDataEvent
export const DAY_S = 24 * 60 * 60;

export type Days = 1 | 7 | 30;
export const DAYS: Days[] = [1, 7, 30];
export const RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP: Record<Days, number> = {
  1: 15 * 60,
  7: 2 * 60 * 60,
  30: 8 * 60 * 60,
};

type ReducedPoolReward = {
  coinType: string;
  totalRewards: BigNumber;
  startTimeMs: number;
  endTimeMs: number;
};

export const calculateSuiRewardsDepositAprPercent = (
  event: ParsedDownsampledApiReserveAssetDataEvent,
  suiEvents: ParsedDownsampledApiReserveAssetDataEvent[],
  reserve: ParsedReserve,
) => {
  const historicalSuiRewardMap: Record<string, ReducedPoolReward[]> = {
    [NORMALIZED_SUI_COINTYPE]: [
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(93613.13),
        startTimeMs: 1713225600000,
        endTimeMs: 1713830400000,
      },
    ],
    [NORMALIZED_USDC_ET_COINTYPE]: [
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(75915.32),
        startTimeMs: 1713225600000,
        endTimeMs: 1713830400000,
      },
    ],
    [NORMALIZED_USDT_ET_COINTYPE]: [
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(64602.32),
        startTimeMs: 1713225600000,
        endTimeMs: 1713830400000,
      },
    ],
  };

  const poolRewards = [
    ...(historicalSuiRewardMap[event.coinType] ?? []),
    ...reserve.depositsPoolRewardManager.poolRewards,
  ].filter(
    (pr) =>
      isSui(pr.coinType) &&
      event.timestampS >= pr.startTimeMs / 1000 &&
      event.timestampS < pr.endTimeMs / 1000,
  );
  if (poolRewards.length === 0) return 0;

  const suiEvent = suiEvents.findLast(
    (e) => e.sampleTimestampS <= event.sampleTimestampS,
  );
  if (!suiEvent) return undefined;

  const rewardsAprPercent = poolRewards.reduce((acc, pr) => {
    const aprPercent = pr.totalRewards
      .times(suiEvent.price)
      .times(new BigNumber(msPerYear).div(pr.endTimeMs - pr.startTimeMs))
      .div(event.depositedAmountUsd)
      .times(100);

    return acc.plus(aprPercent);
  }, new BigNumber(0));

  return +rewardsAprPercent;
};
