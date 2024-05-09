import BigNumber from "bignumber.js";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import AccountBreakdown from "@/components/dashboard/account/AccountBreakdown";
import AccountDetailsDialog from "@/components/dashboard/account-details/AccountDetailsDialog";
import Card from "@/components/dashboard/Card";
import ObligationSwitcherPopover from "@/components/dashboard/ObligationSwitcherPopover";
import UtilizationBar, {
  getWeightedBorrowsUsd,
} from "@/components/dashboard/UtilizationBar";
import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import Tooltip from "@/components/shared/Tooltip";
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

function AccountPositionCardContent() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const obligation = appContext.obligation as ParsedObligation;

  // APR
  const aprWeightedDepositsUsd = obligation.deposits.reduce((acc, deposit) => {
    const totalAprPercent = getTotalAprPercent(
      deposit.reserve.depositAprPercent,
      getFilteredRewards(data.rewardMap[deposit.reserve.coinType].deposit),
    );

    return acc.plus(totalAprPercent.times(deposit.depositedAmountUsd));
  }, new BigNumber(0));

  const aprWeightedBorrowsUsd = obligation.borrows.reduce((acc, borrow) => {
    const totalAprPercent = getTotalAprPercent(
      borrow.reserve.borrowAprPercent,
      getFilteredRewards(data.rewardMap[borrow.reserve.coinType].borrow),
    );

    return acc.plus(totalAprPercent.times(borrow.borrowedAmountUsd));
  }, new BigNumber(0));

  const aprWeightedNetValueUsd = aprWeightedDepositsUsd.minus(
    aprWeightedBorrowsUsd,
  );
  const netAprPercent = aprWeightedNetValueUsd.div(obligation.netValueUsd);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-col gap-1">
          <LabelWithTooltip tooltip={DEPOSITS_TOOLTIP}>
            Deposits
          </LabelWithTooltip>
          <Tooltip
            title={formatUsd(obligation.depositedAmountUsd, { exact: true })}
          >
            <TBody className="w-max">
              {formatUsd(obligation.depositedAmountUsd)}
            </TBody>
          </Tooltip>
        </div>

        <TLabel>-</TLabel>

        <div className="flex flex-col items-center gap-1">
          <LabelWithTooltip className="text-center" tooltip={BORROWS_TOOLTIP}>
            Borrows
          </LabelWithTooltip>
          <Tooltip
            title={formatUsd(obligation.borrowedAmountUsd, { exact: true })}
          >
            <TBody className="w-max text-center">
              {formatUsd(obligation.borrowedAmountUsd)}
            </TBody>
          </Tooltip>
        </div>

        <TLabel>=</TLabel>

        <div className="flex flex-col items-end gap-1">
          <LabelWithTooltip className="text-right" tooltip={EQUITY_TOOLTIP}>
            Equity
          </LabelWithTooltip>
          <Tooltip title={formatUsd(obligation.netValueUsd, { exact: true })}>
            <TBody className="w-max text-right">
              {formatUsd(obligation.netValueUsd)}
            </TBody>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-2">
        <LabelWithTooltip>Net APR</LabelWithTooltip>
        <TBody className="w-max text-right">
          {formatPercent(netAprPercent)}
        </TBody>
      </div>

      <Separator />

      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-col gap-1">
          <LabelWithTooltip tooltip={WEIGHTED_BORROWS_TOOLTIP}>
            Weighted borrows
          </LabelWithTooltip>
          <Tooltip
            title={formatUsd(getWeightedBorrowsUsd(obligation), {
              exact: true,
            })}
          >
            <TBody className="w-max">
              {formatUsd(getWeightedBorrowsUsd(obligation))}
            </TBody>
          </Tooltip>
        </div>

        <div className="flex flex-col items-end gap-1">
          <LabelWithTooltip
            className="text-right"
            tooltip={BORROW_LIMIT_TOOLTIP}
          >
            Borrow limit
          </LabelWithTooltip>
          <Tooltip
            title={formatUsd(obligation.minPriceBorrowLimitUsd, {
              exact: true,
            })}
          >
            <TBody className="w-max text-right">
              {formatUsd(obligation.minPriceBorrowLimitUsd)}
            </TBody>
          </Tooltip>
        </div>
      </div>

      <UtilizationBar />

      <div className="flex flex-row items-center justify-between gap-2">
        <LabelWithTooltip tooltip={LIQUIDATION_THRESHOLD_TOOLTIP}>
          Liquidation threshold
        </LabelWithTooltip>
        <Tooltip
          title={formatUsd(obligation.unhealthyBorrowValueUsd, {
            exact: true,
          })}
        >
          <TBody className="w-max text-right">
            {formatUsd(obligation.unhealthyBorrowValueUsd)}
          </TBody>
        </Tooltip>
      </div>

      <AccountBreakdown />
    </div>
  );
}

export default function AccountPositionCard() {
  const { address } = useWalletContext();
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  return (
    <Card
      id="position"
      header={{
        title: "Account",
        startContent: <AccountDetailsDialog />,
        endContent: data.obligations && data.obligations.length > 1 && (
          <ObligationSwitcherPopover />
        ),
        noSeparator: true,
      }}
    >
      <CardContent>
        {!address ? (
          <TLabelSans>Get started by connecting your wallet.</TLabelSans>
        ) : !obligation ? (
          <TLabelSans>
            No active positions. Get started by depositing assets.
          </TLabelSans>
        ) : (
          <AccountPositionCardContent />
        )}
      </CardContent>
    </Card>
  );
}
