import { useCallback, useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";
import { Side } from "@suilend/sdk/types";

import {
  EventsData,
  TokenAmount,
  getCtokenExchangeRate,
} from "@/components/dashboard/account-details/AccountDetailsDialog";
import DataTable, { tableHeader } from "@/components/dashboard/DataTable";
import TokenLogo from "@/components/shared/TokenLogo";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans, TTitle } from "@/components/shared/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { formatToken, formatUsd } from "@/lib/format";
import { cn, reserveSort } from "@/lib/utils";

interface RowData {
  coinType: string;
  interest: BigNumber;
  rewards: Record<string, BigNumber>;
}

interface EarningsTabContentProps {
  eventsData: EventsData | undefined;
}

export default function EarningsTabContent({
  eventsData,
}: EarningsTabContentProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const obligation = appContext.obligation as ParsedObligation;

  // Data
  const interestEarned = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const netDeposits: Record<string, BigNumber> = {};

    eventsData.deposit.forEach((depositEvent) => {
      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === depositEvent.digest,
      );
      if (!reserveAssetDataEvent) return;

      netDeposits[depositEvent.coinType] =
        netDeposits[depositEvent.coinType] ?? new BigNumber(0);

      const coinMetadata = data.coinMetadataMap[depositEvent.coinType];
      const amount = new BigNumber(depositEvent.ctokenAmount)
        .times(getCtokenExchangeRate(reserveAssetDataEvent))
        .div(10 ** coinMetadata.decimals);

      netDeposits[depositEvent.coinType] =
        netDeposits[depositEvent.coinType].plus(amount);
    });

    eventsData.withdraw.forEach((withdrawEvent) => {
      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === withdrawEvent.digest,
      );
      if (!reserveAssetDataEvent) return;

      netDeposits[withdrawEvent.coinType] =
        netDeposits[withdrawEvent.coinType] ?? new BigNumber(0);

      const coinMetadata = data.coinMetadataMap[withdrawEvent.coinType];
      const amount = new BigNumber(withdrawEvent.ctokenAmount)
        .times(getCtokenExchangeRate(reserveAssetDataEvent))
        .div(10 ** coinMetadata.decimals);

      netDeposits[withdrawEvent.coinType] =
        netDeposits[withdrawEvent.coinType].minus(amount);
    });

    eventsData.liquidate.forEach((liquidateEvent) => {
      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === liquidateEvent.digest,
      );
      if (!reserveAssetDataEvent) return;

      const withdrawReserve = data.lendingMarket.reserves.find(
        (reserve) => reserve.id === liquidateEvent.withdrawReserveId,
      );
      if (!withdrawReserve) return;

      netDeposits[withdrawReserve.coinType] =
        netDeposits[withdrawReserve.coinType] ?? new BigNumber(0);

      const withdrawAmount = new BigNumber(liquidateEvent.withdrawAmount)
        .times(getCtokenExchangeRate(reserveAssetDataEvent))
        .div(10 ** withdrawReserve.mintDecimals);

      netDeposits[withdrawReserve.coinType] =
        netDeposits[withdrawReserve.coinType].minus(withdrawAmount);
    });

    const result: Record<string, BigNumber> = {};
    Object.entries(netDeposits).forEach(([coinType, netDeposit]) => {
      const currentDeposit = obligation.deposits.find(
        (deposit) => deposit.coinType === coinType,
      );

      result[coinType] = new BigNumber(0)
        .plus(currentDeposit?.depositedAmount ?? 0)
        .minus(netDeposit);
    });

    return result;
  }, [
    eventsData,
    data.coinMetadataMap,
    data.lendingMarket.reserves,
    obligation.deposits,
  ]);

  const rewardsEarned = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const result: {
      deposit: Record<string, Record<string, BigNumber>>;
      borrow: Record<string, Record<string, BigNumber>>;
    } = { deposit: {}, borrow: {} };

    eventsData.claimReward.forEach((claimRewardEvent) => {
      const reserve = data.lendingMarket.reserves.find(
        (reserve) => reserve.id === claimRewardEvent.reserveId,
      );
      if (!reserve) return;

      const coinMetadata = data.coinMetadataMap[claimRewardEvent.coinType];
      const claimedAmount = new BigNumber(claimRewardEvent.liquidityAmount).div(
        10 ** coinMetadata.decimals,
      );
      if (claimedAmount.eq(0)) return;

      const side = claimRewardEvent.isDepositReward
        ? Side.DEPOSIT
        : Side.BORROW;

      result[side][reserve.coinType] = result[side][reserve.coinType] ?? {};
      result[side][reserve.coinType][claimRewardEvent.coinType] =
        result[side][reserve.coinType][claimRewardEvent.coinType] ??
        new BigNumber(0);

      result[side][reserve.coinType][claimRewardEvent.coinType] =
        result[side][reserve.coinType][claimRewardEvent.coinType].plus(
          claimedAmount,
        );
    });

    Object.entries(data.rewardMap).forEach(([coinType, rewards]) => {
      [...rewards.deposit, ...rewards.borrow].forEach((reward) => {
        const claimableAmount =
          reward.obligationClaims[obligation.id]?.claimableAmount ??
          new BigNumber(0);
        if (claimableAmount.eq(0)) return;

        const side = reward.stats.side;

        result[side][coinType] = result[side][coinType] ?? {};
        result[side][coinType][reward.stats.rewardCoinType] =
          result[side][coinType][reward.stats.rewardCoinType] ??
          new BigNumber(0);

        result[side][coinType][reward.stats.rewardCoinType] =
          result[side][coinType][reward.stats.rewardCoinType].plus(
            claimableAmount,
          );
      });
    });

    return result;
  }, [
    eventsData,
    data.lendingMarket.reserves,
    data.coinMetadataMap,
    data.rewardMap,
    obligation.id,
  ]);

  const interestPaid = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const netBorrows: Record<string, BigNumber> = {};

    eventsData.borrow.forEach((borrowEvent) => {
      netBorrows[borrowEvent.coinType] =
        netBorrows[borrowEvent.coinType] ?? new BigNumber(0);

      const coinMetadata = data.coinMetadataMap[borrowEvent.coinType];
      const incFeesAmount = new BigNumber(borrowEvent.liquidityAmount).div(
        10 ** coinMetadata.decimals,
      );

      netBorrows[borrowEvent.coinType] =
        netBorrows[borrowEvent.coinType].plus(incFeesAmount);
    });

    eventsData.repay.forEach((repayEvent) => {
      netBorrows[repayEvent.coinType] =
        netBorrows[repayEvent.coinType] ?? new BigNumber(0);

      const coinMetadata = data.coinMetadataMap[repayEvent.coinType];
      const amount = new BigNumber(repayEvent.liquidityAmount).div(
        10 ** coinMetadata.decimals,
      );

      netBorrows[repayEvent.coinType] =
        netBorrows[repayEvent.coinType].minus(amount);
    });

    eventsData.liquidate.forEach((liquidateEvent) => {
      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === liquidateEvent.digest,
      );
      if (!reserveAssetDataEvent) return;

      const repayReserve = data.lendingMarket.reserves.find(
        (reserve) => reserve.id === liquidateEvent.repayReserveId,
      );
      if (!repayReserve) return;

      netBorrows[repayReserve.coinType] =
        netBorrows[repayReserve.coinType] ?? new BigNumber(0);

      const repayAmount = new BigNumber(liquidateEvent.repayAmount)
        .times(getCtokenExchangeRate(reserveAssetDataEvent))
        .div(10 ** repayReserve.mintDecimals);

      netBorrows[repayReserve.coinType] =
        netBorrows[repayReserve.coinType].minus(repayAmount);
    });

    const result: Record<string, BigNumber> = {};
    Object.entries(netBorrows).forEach(([coinType, netBorrow]) => {
      const currentBorrow = obligation.borrows.find(
        (borrow) => borrow.coinType === coinType,
      );

      result[coinType] = new BigNumber(0)
        .plus(currentBorrow?.borrowedAmount ?? 0)
        .minus(netBorrow);
    });

    return result;
  }, [
    eventsData,
    data.coinMetadataMap,
    data.lendingMarket.reserves,
    obligation.borrows,
  ]);

  // Totals
  const totalInterestEarnedUsd = useMemo(() => {
    if (interestEarned === undefined) return undefined;

    return Object.entries(interestEarned).reduce((acc, [coinType, earned]) => {
      const reserve = data.reserveMap[coinType];
      if (!reserve) return acc;

      return acc.plus(earned.times(reserve.price));
    }, new BigNumber(0));
  }, [interestEarned, data.reserveMap]);

  const totalRewardsEarnedUsd = useMemo(() => {
    if (rewardsEarned === undefined) return undefined;

    let result = new BigNumber(0);
    Object.values(rewardsEarned).forEach((sideRewards) => {
      Object.values(sideRewards).forEach((reserveRewards) => {
        Object.entries(reserveRewards).forEach(([rewardCoinType, earned]) => {
          const reserve = data.reserveMap[rewardCoinType];
          if (!reserve) return;

          result = result.plus(earned.times(reserve.price));
        });
      });
    });

    return result;
  }, [rewardsEarned, data.reserveMap]);

  const totalInterestPaidUsd = useMemo(() => {
    if (interestPaid === undefined) return undefined;

    return Object.entries(interestPaid).reduce((acc, [coinType, paid]) => {
      const reserve = data.reserveMap[coinType];
      if (!reserve) return acc;

      return acc.plus(paid.times(reserve.price));
    }, new BigNumber(0));
  }, [interestPaid, data.reserveMap]);

  const totalEarningsUsd = useMemo(() => {
    if (
      totalInterestEarnedUsd === undefined ||
      totalRewardsEarnedUsd === undefined ||
      totalInterestPaidUsd === undefined
    )
      return undefined;

    return totalInterestEarnedUsd
      .plus(totalRewardsEarnedUsd)
      .minus(totalInterestPaidUsd);
  }, [totalInterestEarnedUsd, totalRewardsEarnedUsd, totalInterestPaidUsd]);

  // Columns
  const getColumns = useCallback(
    (interestTitle: string): ColumnDef<RowData>[] => [
      {
        accessorKey: "coinType",
        sortingFn: "text",
        header: ({ column }) => tableHeader(column, "Asset name"),
        cell: ({ row }) => {
          const { coinType } = row.original;

          const coinMetadata = data.coinMetadataMap[coinType];

          return (
            <div className="flex w-max flex-row items-center gap-2">
              <TokenLogo
                className="h-4 w-4"
                coinType={coinType}
                symbol={coinMetadata.symbol}
                src={coinMetadata.iconUrl}
              />

              <TBody className="w-max">{coinMetadata.symbol}</TBody>
            </div>
          );
        },
      },
      {
        accessorKey: "interest",
        enableSorting: false,
        header: ({ column }) => tableHeader(column, interestTitle),
        cell: ({ row }) => {
          const { coinType, interest } = row.original;

          const coinMetadata = data.coinMetadataMap[coinType];

          return (
            <TBody className="w-max">
              {formatToken(interest, { dp: coinMetadata.decimals })}{" "}
              {coinMetadata.symbol}
            </TBody>
          );
        },
      },
      {
        accessorKey: "rewards",
        enableSorting: false,
        header: ({ column }) => tableHeader(column, "Rewards earned"),
        cell: ({ row }) => {
          const { rewards } = row.original;

          if (Object.entries(rewards).length === 0)
            return <TLabelSans className="w-max">N/A</TLabelSans>;
          return (
            <div className="flex w-max flex-col gap-1">
              {Object.entries(rewards)
                .sort((a, b) => (a[0] > b[0] ? -1 : 1))
                .map(([coinType, earned]) => {
                  const coinMetadata = data.coinMetadataMap[coinType];

                  return (
                    <TokenAmount
                      key={coinType}
                      amount={earned}
                      coinType={coinType}
                      symbol={coinMetadata.symbol}
                      src={coinMetadata.iconUrl}
                      decimals={coinMetadata.decimals}
                    />
                  );
                })}
            </div>
          );
        },
      },
    ],
    [data.coinMetadataMap],
  );

  const depositColumns = getColumns("Interest earned");
  const borrowColumns = getColumns("Interest paid");

  // Rows
  const rows = useMemo(() => {
    if (
      interestEarned === undefined ||
      rewardsEarned === undefined ||
      interestPaid === undefined
    )
      return undefined;

    const depositKeys = Array.from(
      new Set([
        ...Object.keys(interestEarned),
        ...Object.keys(rewardsEarned.deposit),
      ]),
    );
    const borrowKeys = Array.from(
      new Set([
        ...Object.keys(interestPaid),
        ...Object.keys(rewardsEarned.borrow),
      ]),
    );

    const depositRows = depositKeys
      .reduce(
        (acc: RowData[], coinType) => [
          ...acc,
          {
            coinType,
            interest: interestEarned[coinType] ?? new BigNumber(0),
            rewards: rewardsEarned.deposit[coinType] ?? {},
          } as RowData,
        ],
        [],
      )
      .sort((a, b) =>
        reserveSort(data.reserveMap[a.coinType], data.reserveMap[b.coinType]),
      );

    const borrowRows = borrowKeys
      .reduce(
        (acc: RowData[], coinType) => [
          ...acc,
          {
            coinType,
            interest: interestPaid[coinType] ?? new BigNumber(0),
            rewards: rewardsEarned.borrow[coinType] ?? {},
          } as RowData,
        ],
        [],
      )
      .sort((a, b) =>
        reserveSort(data.reserveMap[a.coinType], data.reserveMap[b.coinType]),
      );

    return { deposit: depositRows, borrow: borrowRows };
  }, [interestEarned, rewardsEarned, interestPaid, data.reserveMap]);

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col gap-2">
        {totalEarningsUsd !== undefined &&
        totalInterestEarnedUsd !== undefined &&
        totalRewardsEarnedUsd !== undefined &&
        totalInterestPaidUsd !== undefined ? (
          <div className="grid grid-cols-2 gap-4 bg-border p-4 md:grid-cols-4">
            <div className="flex flex-1 flex-col items-center gap-1">
              <TLabelSans className="text-center">Net earnings</TLabelSans>
              <Tooltip title={formatUsd(totalEarningsUsd, { exact: true })}>
                <TBody
                  className={cn(
                    totalEarningsUsd.gt(0) && "text-success",
                    totalEarningsUsd.lt(0) && "text-destructive",
                  )}
                >
                  {totalEarningsUsd.lt(0) && "-"}
                  {formatUsd(totalEarningsUsd.abs())}
                </TBody>
              </Tooltip>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1">
              <TLabelSans className="text-center">Interest earned</TLabelSans>
              <Tooltip
                title={formatUsd(totalInterestEarnedUsd, { exact: true })}
              >
                <TBody className="text-center">
                  {formatUsd(totalInterestEarnedUsd)}
                </TBody>
              </Tooltip>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1">
              <TLabelSans className="text-center">Rewards earned</TLabelSans>
              <Tooltip
                title={formatUsd(totalRewardsEarnedUsd, { exact: true })}
              >
                <TBody className="text-center">
                  {formatUsd(totalRewardsEarnedUsd)}
                </TBody>
              </Tooltip>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1">
              <TLabelSans className="text-center">Interest paid</TLabelSans>
              <Tooltip title={formatUsd(totalInterestPaidUsd, { exact: true })}>
                <TBody className="text-right">
                  {formatUsd(totalInterestPaidUsd)}
                </TBody>
              </Tooltip>
            </div>
          </div>
        ) : (
          <Skeleton
            className="w-full bg-muted/10"
            style={{ height: `${(4 + 4 + 1 + 5 + 4) * 4}px` }}
          />
        )}

        <TLabelSans className="px-4">
          Note: USD values of earnings are calculated using current prices.
        </TLabelSans>
      </div>

      {[
        {
          title: "Assets deposited",
          columns: depositColumns,
          data: rows?.deposit,
          noDataMessage: "No deposits",
        },
        {
          title: "Assets borrowed",
          columns: borrowColumns,
          data: rows?.borrow,
          noDataMessage: "No borrows",
        },
      ].map((table) => (
        <div key={table.title} className="flex flex-col gap-4">
          <TTitle className="px-4 uppercase">{table.title}</TTitle>
          <DataTable<RowData>
            columns={table.columns}
            data={table.data}
            noDataMessage={table.noDataMessage}
            skeletonRows={data.lendingMarket.reserves.length}
            container={{
              className: "overflow-y-visible overflow-x-auto",
            }}
            tableClassName="border-t-0"
            tableCellClassName={(cell) =>
              cn(
                cell && Object.entries(cell.row.original.rewards).length > 1
                  ? "py-2 h-auto"
                  : "py-0 h-12",
              )
            }
          />
        </div>
      ))}
    </div>
  );
}
