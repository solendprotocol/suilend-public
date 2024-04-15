import { SuiClient, SuiEvent } from "@mysten/sui.js/client";

type TypeName = {
  name: string;
};
type Decimal = {
  value: string;
};
type address = string;
type u64 = string;

export function addressToString(addr: address): string {
  return addr;
}

export function u64ToNumber(value: u64): number {
  return parseInt(value);
}

export function typeNameToString(value: TypeName): string {
  return value.name;
}

export function decimalToNumber(value: Decimal): number {
  return parseInt(value.value) / 10 ** 18;
}

export enum SuilendEventType {
  MintEvent = "MintEvent",
  RedeemEvent = "RedeemEvent",
  DepositEvent = "DepositEvent",
  WithdrawEvent = "WithdrawEvent",
  BorrowEvent = "BorrowEvent",
  RepayEvent = "RepayEvent",
  LiquidateEvent = "LiquidateEvent",
  InterestUpdateEvent = "InterestUpdateEvent",
  ReserveAssetDataEvent = "ReserveAssetDataEvent",
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

export class InterestUpdateEvent extends TypedParamsSuiEvent<{
  lending_market: TypeName;
  coin_type: TypeName;
  reserve_id: address;
  cumulative_borrow_rate: Decimal;
  available_amount: u64;
  borrowed_amount: Decimal;
  unclaimed_spread_fees: Decimal;
  ctoken_supply: u64;
  borrow_interest_paid: Decimal;
  spread_fee: Decimal;
  supply_interest_earned: Decimal;
  borrow_interest_paid_usd_estimate: Decimal;
  protocol_fee_usd_estimate: Decimal;
  supply_interest_earned_usd_estimate: Decimal;
}> {}

export class ReserveAssetDataEvent extends TypedParamsSuiEvent<{
  lending_market: TypeName;
  coin_type: TypeName;
  reserve_id: address;
  available_amount: Decimal;
  supply_amount: Decimal;
  borrowed_amount: Decimal;
  available_amount_usd_estimate: Decimal;
  supply_amount_usd_estimate: Decimal;
  borrowed_amount_usd_estimate: Decimal;
  borrow_apr: Decimal;
  supply_apr: Decimal;

  ctoken_supply: u64;
  cumulative_borrow_rate: Decimal;
  price: Decimal;
  smoothed_price: Decimal;
  price_last_update_timestamp_s: u64;
}> {}

export class MintEvent extends TypedParamsSuiEvent<{
  lending_market: TypeName;
  coin_type: TypeName;
  reserve_id: address;
  liquidity_amount: u64;
  ctoken_amount: u64;
}> {}

export class RedeemEvent extends TypedParamsSuiEvent<{
  lending_market: TypeName;
  coin_type: TypeName;
  reserve_id: address;
  ctoken_amount: u64;
  liquidity_amount: u64;
}> {}

export class DepositEvent extends TypedParamsSuiEvent<{
  lending_market: TypeName;
  coin_type: TypeName;
  reserve_id: address;
  obligation_id: address;
  ctoken_amount: u64;
}> {}

export class WithdrawEvent extends TypedParamsSuiEvent<{
  lending_market: TypeName;
  coin_type: TypeName;
  reserve_id: address;
  obligation_id: address;
  ctoken_amount: u64;
}> {}

export class BorrowEvent extends TypedParamsSuiEvent<{
  lending_market: TypeName;
  coin_type: TypeName;
  reserve_id: address;
  obligation_id: address;
  liquidity_amount: u64;
}> {}

export class RepayEvent extends TypedParamsSuiEvent<{
  lending_market: TypeName;
  coin_type: TypeName;
  reserve_id: address;
  obligation_id: address;
  liquidity_amount: u64;
}> {}

export class LiquidateEvent extends TypedParamsSuiEvent<{
  lending_market: TypeName;
  repay_reserve_id: address;
  withdraw_reserve_id: address;
  obligation_id: address;
  repay_amount: u64;
  withdraw_amount: u64;
  protocol_fee_amount: u64;
  liquidator_bonus_amount: u64;
}> {}

export class ClaimRewardEvent extends TypedParamsSuiEvent<{
  coin_type: TypeName;
  is_deposit_reward: boolean;
  lending_market_id: string;
  liquidity_amount: string;
  obligation_id: string;
  pool_reward_id: string;
  reserve_id: "0x0b8faf51e65f0beee47f6b9627108ee25b5a2b922ae7ee5725485ed7a9293523";
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
