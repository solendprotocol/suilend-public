export const DEPOSITS_TOOLTIP =
  "Value of all assets deposited. Increasing this value increases your borrow limit and liquidation threshold.";

export const BORROWS_TOOLTIP = "Value of all assets borrowed.";

export const EQUITY_TOOLTIP =
  "Value of your account calculated as (deposit - borrow).";

export const WEIGHTED_BORROW_TOOLTIP = (
  <>
    The weighted borrow is the value of all assets borrowed, adjusted by their
    borrow weight (BW).
    <br />
    <br />
    <span className="font-mono text-muted-foreground">
      Formula:
      <br />
      <span className="uppercase">Position × Price × Borrow weight</span>
    </span>
  </>
);

export const BORROW_LIMIT_TOOLTIP = (
  <>
    The borrow limit is the maximum amount you can borrow. Deposit more assets
    to increase your borrow limit.
    <br />
    <br />
    <span className="font-mono text-muted-foreground">
      Formula:
      <br />
      <span className="uppercase">Position × Price × Open LTV</span>
    </span>
  </>
);

export const LIQUIDATION_THRESHOLD_TOOLTIP = (
  <>
    If your weighted borrow exceeds the liquidation threshold your account will
    be at risk of liquidation. Deposit more assets to increase your liquidation
    threshold.
    <br />
    <br />
    <span className="font-mono text-muted-foreground">
      Formula:
      <br />
      <span className="uppercase">Position × Price × Close LTV</span>
    </span>
  </>
);
