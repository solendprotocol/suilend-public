export const DEPOSITS_TOOLTIP =
  "The value of all assets deposited. Depositing more assets increases your borrow limit and liquidation threshold.";

export const BORROWS_TOOLTIP = "The value of all assets borrowed.";

export const EQUITY_TOOLTIP =
  "The total value of your account, calculated as (deposits - borrows).";

export const WEIGHTED_BORROWS_TOOLTIP = (
  <>
    Your weighted borrows is the value of all assets borrowed, adjusted by their
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
    The borrow limit is the maximum amount you can borrow. Depositing more
    assets increases your borrow limit.
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
    If your weighted borrows exceed your liquidation threshold, your account
    will be at risk of liquidation. Depositing more assets increases your
    liquidation threshold.
    <br />
    <br />
    <span className="font-mono text-muted-foreground">
      Formula:
      <br />
      <span className="uppercase">Position × Price × Close LTV</span>
    </span>
  </>
);
