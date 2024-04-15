import { SuiClient, SuiEvent } from "@mysten/sui.js/client";

export enum SuilendEventType {
  RedeemEvent = "RedeemEvent",
  WithdrawEvent = "WithdrawEvent",
  InterestUpdateEvent = "InterestUpdateEvent",
}

export enum SuilendTransactionModule {
  LendingMarket = "lending_market",
  Reserve = "reserve",
}

class TypedParamsSuiEvent<T> {
  event: SuiEvent;

  constructor(event: SuiEvent) {
    this.event = event;
  }

  params(): T {
    return this.event.parsedJson as T;
  }

  isType(module: SuilendTransactionModule, eventType: SuilendEventType) {
    return this.event.type.includes(`${module}::${eventType}`);
  }
}

export class GenericSuilendEvent extends TypedParamsSuiEvent<{}> {}

export class RedeemEvent extends TypedParamsSuiEvent<{
  ctoken_amount: string;
  liquidity_amount: string;
}> {}

export class WithdrawEvent extends TypedParamsSuiEvent<{
  caller: string;
  ctoken_amount: string;
  obligation_id: string;
}> {}

export class InterestUpdateEvent extends TypedParamsSuiEvent<{
  available_amount: string;
  borrowed_amount: {};
  ctoken_supply: string;
  cumulative_borrow_rate: {};
  reserve_id: string;
  timestamp_s: string;
}> {}

export async function getEvents(
  client: SuiClient,
  digest: string,
): Promise<GenericSuilendEvent[]> {
  const tx = await client.getTransactionBlock({
    digest,
    options: { showEvents: true },
  });
  const events: GenericSuilendEvent[] = [];
  for (const event of tx.events || []) {
    events.push(new GenericSuilendEvent(event));
  }
  return events;
}

export async function getRedeemEvent(
  client: SuiClient,
  digest: string,
): Promise<RedeemEvent | null> {
  const events = await getEvents(client, digest);
  for (const event of events) {
    if (
      event.isType(
        SuilendTransactionModule.LendingMarket,
        SuilendEventType.RedeemEvent,
      )
    ) {
      return event as RedeemEvent;
    }
  }
  return null;
}
