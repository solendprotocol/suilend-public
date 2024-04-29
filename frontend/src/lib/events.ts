import BigNumber from "bignumber.js";

export type GenericEvent = {
  timestamp: number;
  eventIndex: number;
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

export const eventSortFunction = (a: GenericEvent, b: GenericEvent) => {
  const aDate = new Date(a.timestamp * 1000).getTime();
  const bDate = new Date(b.timestamp * 1000).getTime();
  if (aDate !== bDate) return bDate - aDate;

  const aEventIndex = a.eventIndex;
  const bEventIndex = b.eventIndex;

  return bEventIndex - aEventIndex;
};

export const getDedupedClaimRewardEvents = (events: ClaimRewardEvent[]) => {
  const dedupedClaimRewardEvents: ClaimRewardEvent[] = [];
  for (const event of events) {
    const lastEvent =
      dedupedClaimRewardEvents[dedupedClaimRewardEvents.length - 1];

    if (!lastEvent) dedupedClaimRewardEvents.push(event);
    else {
      if (
        lastEvent.coinType === event.coinType &&
        lastEvent.isDepositReward === event.isDepositReward &&
        lastEvent.timestamp === event.timestamp &&
        lastEvent.digest === event.digest
      ) {
        dedupedClaimRewardEvents[
          dedupedClaimRewardEvents.length - 1
        ].liquidityAmount = new BigNumber(lastEvent.liquidityAmount)
          .plus(event.liquidityAmount)
          .toString();
      } else dedupedClaimRewardEvents.push(event);
    }
  }

  return dedupedClaimRewardEvents;
};
