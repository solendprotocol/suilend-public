import Latex from "react-latex-next";

import TextLink from "@/components/shared/TextLink";
import "katex/dist/katex.min.css";
import { Separator } from "@/components/ui/separator";

export const OPEN_LTV_BW_TOOLTIP =
  "Open LTV is a ratio that determines how much borrow power is contributed by a deposited asset. Borrow weight (BW) is a multiplier on the value borrowed, used for borrow limit calculations.";

export const DEPOSITS_TOOLTIP =
  "The value of all assets deposited. Depositing more assets increases your borrow limit and liquidation threshold.";

export const BORROWS_TOOLTIP = "The value of all assets borrowed.";

export const EQUITY_TOOLTIP = (
  <>
    The total value of your account.
    <br />
    <br />
    <span className="font-mono text-muted-foreground">
      Formula:
      <br />
      <span className="uppercase">Deposits - Borrows</span>
    </span>
  </>
);

export const NET_APR_TOOLTIP = (
  <>
    If your account is worth $X today, assuming no prices or rates change, in 1
    year it will be worth $X × (1 + Net APR).
    <br />
    <br />
    <Separator />
    <span className="text-muted-foreground">
      <Latex>
        {
          "$$D = \\sum_{i=0}^{N(\\textnormal{Deposits})} USD(d_i) \\times APR(d_i)$$"
        }
      </Latex>
      <Latex>
        {
          "$$B = \\sum_{i=0}^{N(\\textnormal{Borrows})} USD(b_i) \\times APR(b_i)$$"
        }
      </Latex>
      <Latex>
        {"$$\\textnormal{Net APR} = \\frac{D-B}{USD(d) - USD(b)}$$"}
      </Latex>
    </span>
  </>
);

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

export const WEIGHTED_BORROWS_PRICE_TOOLTIP = (
  <>
    {
      "In weighted borrows calculations, the price is defined as the maximum of the price and the "
    }
    <TextLink
      href="https://docs.pyth.network/price-feeds/how-pyth-works/ema-price-aggregation"
      noIcon
    >
      exponentially-weighted moving average (EMA) price
    </TextLink>
    {"."}
  </>
);

export const BORROW_LIMIT_PRICE_TOOLTIP = (
  <>
    {
      "In borrow limit calculations, the price is defined as the minimum of the price and the "
    }
    <TextLink
      href="https://docs.pyth.network/price-feeds/how-pyth-works/ema-price-aggregation"
      noIcon
    >
      exponentially-weighted moving average (EMA) price
    </TextLink>
    {"."}
  </>
);
