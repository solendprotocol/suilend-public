import BigNumber from "bignumber.js";

import { ParsedDownsampledApiReserveAssetDataEvent } from "@suilend/sdk/parsers/apiReserveAssetDataEvent";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import {
  NORMALIZED_SUI_COINTYPE,
  NORMALIZED_USDC_ET_COINTYPE,
  NORMALIZED_USDT_ET_COINTYPE,
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

export const calculateRewardsDepositAprPercent = (
  event: ParsedDownsampledApiReserveAssetDataEvent,
  rewardsEvents: ParsedDownsampledApiReserveAssetDataEvent[],
  reserve: ParsedReserve,
) => {
  if (rewardsEvents.length === 0) return 0;

  const rewardsEvent = rewardsEvents.findLast(
    (e) => e.sampleTimestampS <= event.sampleTimestampS,
  );
  if (!rewardsEvent) return 0;

  const rewardCoinType = rewardsEvent.coinType;

  const historicalRewardsMap: Record<string, ReducedPoolReward[]> = {
    [NORMALIZED_SUI_COINTYPE]: [
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(93613.13),
        startTimeMs: 1713225600000,
        endTimeMs: 1713830400000,
      },
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(177579),
        startTimeMs: 1713830400000, // 2024-04-23 08:00:00
        endTimeMs: 1715040000000, // 2024-05-07 08:00:00
      },
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(162386.57),
        startTimeMs: 1715040000000, // 2024-05-07 08:00:00
        endTimeMs: 1716249600000, //2024-05-21 08:00:00
      },
    ],
    [NORMALIZED_USDC_ET_COINTYPE]: [
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(75915.32),
        startTimeMs: 1713225600000,
        endTimeMs: 1713830400000,
      },
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(168534),
        startTimeMs: 1713830400000, // 2024-04-23 08:00:00
        endTimeMs: 1715040000000, // 2024-05-07 08:00:00
      },
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(176679.79),
        startTimeMs: 1715040000000, // 2024-05-07 08:00:00
        endTimeMs: 1716249600000, //2024-05-21 08:00:00
      },
    ],
    [NORMALIZED_USDT_ET_COINTYPE]: [
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(64602.32),
        startTimeMs: 1713225600000,
        endTimeMs: 1713830400000,
      },
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(128939),
        startTimeMs: 1713830400000, // 2024-04-23 08:00:00
        endTimeMs: 1715040000000, // 2024-05-07 08:00:00
      },
      {
        coinType: NORMALIZED_SUI_COINTYPE,
        totalRewards: new BigNumber(116534.73),
        startTimeMs: 1715040000000, // 2024-05-07 08:00:00
        endTimeMs: 1716249600000, //2024-05-21 08:00:00
      },
    ],
  };

  const allPoolRewards: ReducedPoolReward[] = [
    ...reserve.depositsPoolRewardManager.poolRewards,
  ];
  (historicalRewardsMap[event.coinType] ?? []).forEach((hr) => {
    if (
      allPoolRewards.find(
        (pr) =>
          pr.coinType === hr.coinType &&
          pr.startTimeMs === hr.startTimeMs &&
          pr.endTimeMs === hr.endTimeMs,
      )
    )
      return;

    allPoolRewards.push({
      coinType: hr.coinType,
      totalRewards: hr.totalRewards,
      startTimeMs: hr.startTimeMs,
      endTimeMs: hr.endTimeMs,
    });
  });

  const poolRewards = allPoolRewards.filter(
    (pr) =>
      pr.coinType === rewardCoinType &&
      event.timestampS >= pr.startTimeMs / 1000 &&
      event.timestampS < pr.endTimeMs / 1000,
  );
  if (poolRewards.length === 0) return 0;

  const rewardsAprPercent = poolRewards.reduce(
    (acc, pr) =>
      acc.plus(
        pr.totalRewards
          .times(rewardsEvent.price)
          .times(new BigNumber(msPerYear).div(pr.endTimeMs - pr.startTimeMs))
          .div(event.depositedAmountUsd)
          .times(100),
      ),
    new BigNumber(0),
  );

  return +rewardsAprPercent;
};
