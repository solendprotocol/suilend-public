import BigNumber from "bignumber.js";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { ParsedDownsampledReserveAssetDataEvent } from "@suilend/sdk/parsers/reserveAssetDataEvent";

import {
  NORMALIZED_SUI_COINTYPE,
  NORMALIZED_USDC_ET_COINTYPE,
  NORMALIZED_USDT_ET_COINTYPE,
  isSui,
} from "@/lib/coinType";
import { msPerYear } from "@/lib/constants";

export enum EventType {
  RESERVE_ASSET_DATA = "reserveAssetData",
  DEPOSIT = "deposit",
  BORROW = "borrow",
  WITHDRAW = "withdraw",
  REPAY = "repay",
  LIQUIDATE = "liquidate",
  CLAIM_REWARD = "claimReward",
}

export const EventTypeNameMap: Record<EventType, string> = {
  [EventType.RESERVE_ASSET_DATA]: "Reserve asset data",
  [EventType.DEPOSIT]: "Deposit",
  [EventType.BORROW]: "Borrow",
  [EventType.WITHDRAW]: "Withdraw",
  [EventType.REPAY]: "Repay",
  [EventType.LIQUIDATE]: "Liquidation",
  [EventType.CLAIM_REWARD]: "Claim rewards",
};

export type ReserveAssetDataEvent = {
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

export type MintEvent = {
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

export type RedeemEvent = {
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

export type DepositEvent = {
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

export type BorrowEvent = {
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

export type WithdrawEvent = {
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

export type RepayEvent = {
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

export type LiquidateEvent = {
  id: number;
  lendingMarketId: string;
  repayReserveId: string;
  withdrawReserveId: string;
  obligationId: string;
  repayAmount: string;
  withdrawAmount: string;
  protocolFeeAmount: string;
  liquidatorBonusAmount: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

export type ClaimRewardEvent = {
  id: number;
  coinType: string;
  isDepositReward: boolean;
  lendingMarketId: string;
  liquidityAmount: string;
  obligationId: string;
  poolRewardId: string;
  reserveId: string;
  timestamp: number;
  digest: string;
  eventIndex: number;
  sender: string;
};

type EventRow = {
  timestamp: number;
  eventIndex: number;
};

export const eventSortDesc = (a: EventRow, b: EventRow) => {
  const aDate = new Date(a.timestamp * 1000).getTime();
  const bDate = new Date(b.timestamp * 1000).getTime();
  if (aDate !== bDate) return bDate - aDate;

  return b.eventIndex - a.eventIndex;
};

export const eventSortAsc = (a: EventRow, b: EventRow) =>
  -1 * eventSortDesc(a, b);

// DownsampledReserveAssetDataEvent
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
  event: ParsedDownsampledReserveAssetDataEvent,
  suiEvents: ParsedDownsampledReserveAssetDataEvent[],
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
