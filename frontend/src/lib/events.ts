import BigNumber from "bignumber.js";

import { WAD } from "@suilend/sdk/constants";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

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

// APRs
export const calculateUtilizationPercent = (
  reserve: ParsedReserve,
  event: ReserveAssetDataEvent,
) => {
  const availableAmount = new BigNumber(event.availableAmount)
    .div(WAD.toString())
    .div(10 ** reserve.mintDecimals);
  const borrowedAmount = new BigNumber(event.borrowedAmount)
    .div(WAD.toString())
    .div(10 ** reserve.mintDecimals);
  const depositedAmount = borrowedAmount.plus(availableAmount);

  if (depositedAmount.eq(0)) return new BigNumber(0);
  return borrowedAmount.div(depositedAmount).times(100);
};

export const calculateBorrowAprPercent = (
  reserve: ParsedReserve,
  event: ReserveAssetDataEvent,
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

      return leftAprPercent.plus(
        weight.times(rightAprPercent.minus(leftAprPercent)),
      );
    }
    i = i + 1;
  }
  // Should never reach here
  return new BigNumber(0);
};

export const calculateDepositAprPercent = (
  reserve: ParsedReserve,
  event: ReserveAssetDataEvent,
) => {
  const currentUtilPercent = calculateUtilizationPercent(reserve, event);
  const borrowAprPercent = calculateBorrowAprPercent(reserve, event);
  const spreadFeePercent = new BigNumber(reserve.config.spreadFeeBps).div(100);

  return currentUtilPercent
    .div(100)
    .times(borrowAprPercent)
    .times(new BigNumber(1).minus(spreadFeePercent.div(100)));
};
