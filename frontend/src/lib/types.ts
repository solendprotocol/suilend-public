export enum Action {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  BORROW = "borrow",
  REPAY = "repay",
}

export type Token = {
  coinType: string;
  symbol: string;
  iconUrl?: string | null;
};
