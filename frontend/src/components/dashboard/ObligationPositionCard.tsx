import BigNumber from "bignumber.js";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import Card from "@/components/dashboard/Card";
import ObligationBreakdown from "@/components/dashboard/ObligationBreakdown";
import ObligationSwitcherPopover from "@/components/dashboard/ObligationSwitcherPopover";
import UtilizationBar from "@/components/dashboard/UtilizationBar";
import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import { TBody, TLabel, TLabelSans } from "@/components/shared/Typography";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatPercent, formatUsd } from "@/lib/format";
import { getFilteredRewards, getTotalAprPercent } from "@/lib/liquidityMining";
import {
  BORROWS_TOOLTIP,
  BORROW_LIMIT_TOOLTIP,
  DEPOSITS_TOOLTIP,
  EQUITY_TOOLTIP,
  LIQUIDATION_THRESHOLD_TOOLTIP,
  WEIGHTED_BORROWS_TOOLTIP,
} from "@/lib/tooltips";

function ObligationPositionCardContent() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const obligation = appContext.obligation as ParsedObligation;

  // APR
  const weightedDepositsUsd = obligation.deposits.reduce((acc, deposit) => {
    const totalAprPercent = getTotalAprPercent(
      deposit.reserve.depositAprPercent,
      getFilteredRewards(data.rewardMap[deposit.reserve.coinType].deposit),
    );

    return acc.plus(totalAprPercent.times(deposit.depositedAmountUsd));
  }, new BigNumber(0));

  const weightedBorrowsUsd = obligation.borrows.reduce((acc, borrow) => {
    const totalAprPercent = getTotalAprPercent(
      borrow.reserve.borrowAprPercent,
      getFilteredRewards(data.rewardMap[borrow.reserve.coinType].borrow),
    );

    return acc.plus(totalAprPercent.times(borrow.borrowedAmountUsd));
  }, new BigNumber(0));

  const weightedNetUsd = weightedDepositsUsd.minus(weightedBorrowsUsd);
  const netAprPercent = weightedNetUsd.div(obligation.netValueUsd);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-col gap-1">
          <LabelWithTooltip tooltip={DEPOSITS_TOOLTIP}>
            Deposits
          </LabelWithTooltip>
          <TBody>{formatUsd(obligation.depositedAmountUsd)}</TBody>
        </div>

        <TLabel>-</TLabel>

        <div className="flex flex-col items-center gap-1">
          <LabelWithTooltip className="text-center" tooltip={BORROWS_TOOLTIP}>
            Borrows
          </LabelWithTooltip>
          <TBody className="text-center">
            {formatUsd(obligation.borrowedAmountUsd)}
          </TBody>
        </div>

        <TLabel>=</TLabel>

        <div className="flex flex-col items-end gap-1">
          <LabelWithTooltip className="text-right" tooltip={EQUITY_TOOLTIP}>
            Equity
          </LabelWithTooltip>
          <TBody className="text-right">
            {formatUsd(obligation.netValueUsd)}
          </TBody>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-2">
        <LabelWithTooltip>Net APR</LabelWithTooltip>
        <TBody className="text-right">{formatPercent(netAprPercent)}</TBody>
      </div>

      <Separator />

      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-col gap-1">
          <LabelWithTooltip tooltip={WEIGHTED_BORROWS_TOOLTIP}>
            Weighted borrows
          </LabelWithTooltip>
          <TBody>{formatUsd(obligation.maxPriceWeightedBorrowsUsd)}</TBody>
        </div>

        <div className="flex flex-col items-end gap-1">
          <LabelWithTooltip
            className="text-right"
            tooltip={BORROW_LIMIT_TOOLTIP}
          >
            Borrow limit
          </LabelWithTooltip>
          <TBody className="text-right">
            {formatUsd(obligation.minPriceBorrowLimitUsd)}
          </TBody>
        </div>
      </div>

      <UtilizationBar />

      <div className="flex flex-row items-center justify-between gap-2">
        <LabelWithTooltip tooltip={LIQUIDATION_THRESHOLD_TOOLTIP}>
          Liquidation threshold
        </LabelWithTooltip>
        <TBody className="text-right">
          {formatUsd(obligation.unhealthyBorrowValueUsd)}
        </TBody>
      </div>

      <ObligationBreakdown />
    </div>
  );
}

export default function ObligationPositionCard() {
  const { address } = useWalletContext();
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  return (
    <Card
      id="position"
      title="Account"
      headerEndContent={
        data.obligations &&
        data.obligations.length > 1 && <ObligationSwitcherPopover />
      }
      noHeaderSeparator
    >
      <CardContent>
        {!address ? (
          <TLabelSans>Get started by connecting your wallet.</TLabelSans>
        ) : !obligation ? (
          <TLabelSans>
            No active positions. Get started by depositing assets.
          </TLabelSans>
        ) : (
          <ObligationPositionCardContent />
        )}
      </CardContent>
    </Card>
  );
}
