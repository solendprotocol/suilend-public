import BigNumber from "bignumber.js";
import { useLocalStorage } from "usehooks-ts";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import Card from "@/components/dashboard/Card";
import ObligationBreakdown from "@/components/dashboard/ObligationBreakdown";
import ObligationSwitcherPopover from "@/components/dashboard/ObligationSwitcherPopover";
import UtilizationBar from "@/components/dashboard/UtilizationBar";
import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import LabelWithValue from "@/components/shared/LabelWithValue";
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
  WEIGHTED_BORROW_TOOLTIP,
} from "@/lib/tooltips";

function ObligationCardContent() {
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

  // Breakdown
  const [isBreakdownOpen, setIsBreakdownOpen] = useLocalStorage<boolean>(
    "isPositionBreakdownOpen",
    false,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <LabelWithValue
          className="w-max items-start text-left"
          label="Deposits"
          labelTooltip={DEPOSITS_TOOLTIP}
          value={obligation.totalSupplyUsd}
          isUsd
        />

        <TLabel className="flex flex-1 flex-col justify-center text-center">
          -
        </TLabel>

        <LabelWithValue
          className="w-max items-center text-center"
          label="Borrows"
          labelTooltip={BORROWS_TOOLTIP}
          value={obligation.totalBorrowUsd}
          isUsd
        />

        <TLabel className="flex flex-1 flex-col justify-center text-center">
          =
        </TLabel>

        <LabelWithValue
          className="w-max items-end text-right"
          label="Equity"
          labelTooltip={EQUITY_TOOLTIP}
          value={obligation.netValueUsd}
          isUsd
        />
      </div>

      <LabelWithValue
        label="Net APR"
        value={formatPercent(netAprPercent)}
        horizontal
      />

      <Separator />

      <div className="flex flex-row justify-between gap-2">
        <div className="flex flex-col gap-1">
          <LabelWithTooltip tooltip={WEIGHTED_BORROW_TOOLTIP}>
            Weighted borrow
          </LabelWithTooltip>
          <TBody>{formatUsd(obligation.totalWeightedBorrowUsd)}</TBody>
        </div>

        <div className="flex flex-col items-end gap-1">
          <LabelWithTooltip
            className="text-right"
            tooltip={BORROW_LIMIT_TOOLTIP}
          >
            Borrow limit
          </LabelWithTooltip>
          <TBody className="text-right">
            {formatUsd(obligation.borrowLimit)}
          </TBody>
        </div>
      </div>

      {!obligation.totalSupplyUsd.eq(0) && (
        <UtilizationBar onClick={() => setIsBreakdownOpen(!isBreakdownOpen)} />
      )}

      <div className="flex flex-row items-center justify-between gap-2">
        <LabelWithTooltip tooltip={LIQUIDATION_THRESHOLD_TOOLTIP}>
          Liquidation threshold
        </LabelWithTooltip>
        <TBody className="text-right">
          {formatUsd(obligation.unhealthyBorrowValueUsd)}
        </TBody>
      </div>

      <ObligationBreakdown
        isBreakdownOpen={isBreakdownOpen}
        setIsBreakdownOpen={setIsBreakdownOpen}
      />
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
      title="Position"
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
            No active positions. Start by depositing assets.
          </TLabelSans>
        ) : (
          <ObligationCardContent />
        )}
      </CardContent>
    </Card>
  );
}
