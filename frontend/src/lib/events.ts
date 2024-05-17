import BigNumber from "bignumber.js";

import { WAD } from "@suilend/sdk/constants";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

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

// ReserveAssetDataEvent
export type DownsampledReserveAssetDataEvent = ReserveAssetDataEvent & {
  sampletimestamp: number;
};

export type SuiReserveEventMap = Record<
  Days,
  DownsampledReserveAssetDataEvent[]
>;

export type Days = 1 | 7 | 30;
export const DAYS: Days[] = [1, 7, 30];
export const RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP: Record<Days, number> = {
  1: 15 * 60,
  7: 2 * 60 * 60,
  30: 8 * 60 * 60,
};

export const getBorrowedAmount = (
  reserve: ParsedReserve,
  event: DownsampledReserveAssetDataEvent,
) => {
  return new BigNumber(event.borrowedAmount)
    .div(WAD.toString())
    .div(10 ** reserve.mintDecimals);
};

export const getDepositedAmount = (
  reserve: ParsedReserve,
  event: DownsampledReserveAssetDataEvent,
) => {
  const availableAmount = new BigNumber(event.availableAmount)
    .div(WAD.toString())
    .div(10 ** reserve.mintDecimals);
  const borrowedAmount = getBorrowedAmount(reserve, event);

  return borrowedAmount.plus(availableAmount);
};

export const calculateUtilizationPercent = (
  reserve: ParsedReserve,
  event: DownsampledReserveAssetDataEvent,
) => {
  const depositedAmount = getDepositedAmount(reserve, event);
  const borrowedAmount = getBorrowedAmount(reserve, event);

  if (depositedAmount.eq(0)) return new BigNumber(0);
  return borrowedAmount.div(depositedAmount).times(100);
};

export const calculateBorrowAprPercent = (
  reserve: ParsedReserve,
  event: DownsampledReserveAssetDataEvent,
) => {
  const config = reserve.config;
  const currentUtilPercent = calculateUtilizationPercent(reserve, event);

  let i = 1;
  while (i < config.interestRate.length) {
    const leftUtilPercent = config.interestRate[i - 1].utilPercent;
    const leftAprPercent = config.interestRate[i - 1].aprPercent;

    const rightUtilPercent = config.interestRate[i].utilPercent;
    const rightAprPercent = config.interestRate[i].aprPercent;

    if (
      currentUtilPercent.gte(leftUtilPercent) &&
      currentUtilPercent.lte(rightUtilPercent)
    ) {
      const weight = new BigNumber(
        currentUtilPercent.minus(leftUtilPercent),
      ).div(rightUtilPercent.minus(leftUtilPercent));

      return +leftAprPercent.plus(
        weight.times(rightAprPercent.minus(leftAprPercent)),
      );
    }
    i = i + 1;
  }
  // Should never reach here
  return +new BigNumber(0);
};

export const calculateDepositAprPercent = (
  reserve: ParsedReserve,
  event: DownsampledReserveAssetDataEvent,
  suiReserveEvents: DownsampledReserveAssetDataEvent[],
) => {
  const currentUtilPercent = calculateUtilizationPercent(reserve, event);
  const borrowAprPercent = calculateBorrowAprPercent(reserve, event);
  const spreadFeePercent = new BigNumber(reserve.config.spreadFeeBps).div(100);

  const depositAprPercent = currentUtilPercent
    .div(100)
    .times(borrowAprPercent)
    .times(new BigNumber(1).minus(spreadFeePercent.div(100)));

  type ReducedPoolReward = {
    coinType: string;
    totalRewards: BigNumber;
    startTimeMs: number;
    endTimeMs: number;
  };

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
  const historicalSuiRewards = historicalSuiRewardMap[event.coinType] ?? [];

  const poolRewards = [
    ...historicalSuiRewards,
    ...reserve.depositsPoolRewardManager.poolRewards,
  ].filter(
    (pr) =>
      isSui(pr.coinType) &&
      event.timestamp >= pr.startTimeMs / 1000 &&
      event.timestamp < pr.endTimeMs / 1000,
  );
  if (poolRewards.length === 0) return +depositAprPercent;

  const suiReserveEvent = suiReserveEvents.findLast(
    (e) => e.sampletimestamp <= event.sampletimestamp,
  );
  if (!suiReserveEvent) return undefined;

  const suiPrice = new BigNumber(suiReserveEvent.price).div(WAD.toString());

  const price = new BigNumber(event.price).div(WAD.toString());
  const depositedAmountUsd = getDepositedAmount(reserve, event).times(price);

  const rewardsAprPercent = poolRewards.reduce((acc, pr) => {
    const aprPercent = pr.totalRewards
      .times(suiPrice)
      .times(new BigNumber(msPerYear).div(pr.endTimeMs - pr.startTimeMs))
      .div(depositedAmountUsd)
      .times(100);

    return acc.plus(aprPercent);
  }, new BigNumber(0));

  return +depositAprPercent.plus(rewardsAprPercent);
};
