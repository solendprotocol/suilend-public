import { useRouter } from "next/router";

import BigNumber from "bignumber.js";
import { FileClock, TrendingUp } from "lucide-react";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";

import AccountBreakdown from "@/components/dashboard/account/AccountBreakdown";
import BorrowLimitTitle from "@/components/dashboard/account/BorrowLimitTitle";
import LiquidationThresholdTitle from "@/components/dashboard/account/LiquidationThresholdTitle";
import SubaccountDropdownMenu from "@/components/dashboard/account/SubaccountDropdownMenu";
import WeightedBorrowsTitle from "@/components/dashboard/account/WeightedBorrowsTitle";
import {
  QueryParams as AccountDetailsQueryParams,
  Tab as AccountDetailsTab,
} from "@/components/dashboard/account-details/AccountDetailsDialog";
import Card from "@/components/dashboard/Card";
import UtilizationBar, {
  getWeightedBorrowsUsd,
} from "@/components/dashboard/UtilizationBar";
import Button from "@/components/shared/Button";
import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatPercent, formatUsd } from "@/lib/format";
import { getFilteredRewards, getTotalAprPercent } from "@/lib/liquidityMining";
import { shallowPushQuery } from "@/lib/router";
import {
  BORROWS_TOOLTIP,
  DEPOSITS_TOOLTIP,
  NET_APR_TOOLTIP,
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
  const netAprPercent = !obligation.netValueUsd.eq(0)
    ? aprWeightedNetValueUsd.div(obligation.netValueUsd)
    : new BigNumber(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full">
        <div className="absolute bottom-0 left-0 right-2/3 top-0 z-[1] rounded-l-sm bg-gradient-to-r from-primary/15 to-transparent" />

        <div className="relative z-[2] flex flex-row items-center justify-around gap-1 rounded-sm border border-primary/10 px-4 py-3">
          <div className="flex flex-col items-center gap-1">
            <LabelWithTooltip className="text-center">Equity</LabelWithTooltip>
            <Tooltip title={formatUsd(obligation.netValueUsd, { exact: true })}>
              <TBody className="w-max text-center">
                {formatUsd(obligation.netValueUsd)}
              </TBody>
            </Tooltip>
          </div>

          <TLabelSans>=</TLabelSans>

          <div className="flex flex-col items-center gap-1">
            <LabelWithTooltip
              className="text-center"
              tooltip={DEPOSITS_TOOLTIP}
            >
              Deposits
            </LabelWithTooltip>
            <Tooltip
              title={formatUsd(obligation.depositedAmountUsd, { exact: true })}
            >
              <TBody className="w-max text-center">
                {formatUsd(obligation.depositedAmountUsd)}
              </TBody>
            </Tooltip>
          </div>

          <TLabelSans>-</TLabelSans>

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
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-2">
        <LabelWithTooltip tooltip={NET_APR_TOOLTIP}>Net APR</LabelWithTooltip>
        <TBody className="w-max text-right">
          {formatPercent(netAprPercent)}
        </TBody>
      </div>

      {obligation.positionCount > 0 && (
        <>
          <Separator />

          <div className="flex flex-row justify-between gap-2">
            <div className="flex flex-col gap-1">
              <WeightedBorrowsTitle />
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
              <BorrowLimitTitle />
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
            <LiquidationThresholdTitle />
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
        </>
      )}
    </div>
  );
}

export default function AccountPositionCard() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  const openAccountDetailsTab = (tab: AccountDetailsTab) => {
    shallowPushQuery(router, {
      ...router.query,
      [AccountDetailsQueryParams.ACCOUNT_DETAILS]: true,
      [AccountDetailsQueryParams.TAB]: tab,
    });
  };

  return (
    <Card
      id={address && obligation ? "position" : undefined}
      header={{
        title: "Account",
        endContent: (
          <>
            {address && obligation && (
              <>
                <Button
                  className="text-muted-foreground"
                  icon={<TrendingUp />}
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    openAccountDetailsTab(AccountDetailsTab.EARNINGS)
                  }
                >
                  Earnings
                </Button>
                <Button
                  className="text-muted-foreground"
                  icon={<FileClock />}
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    openAccountDetailsTab(AccountDetailsTab.HISTORY)
                  }
                >
                  History
                </Button>
              </>
            )}

            {data.obligations && data.obligations.length > 1 && (
              <SubaccountDropdownMenu />
            )}
          </>
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
