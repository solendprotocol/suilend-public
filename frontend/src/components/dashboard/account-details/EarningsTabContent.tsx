import { useCallback, useMemo } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import { HandCoins, PiggyBank } from "lucide-react";

import { WAD } from "@suilend/sdk/constants";
import { ParsedObligation } from "@suilend/sdk/parsers/obligation";
import {
  ApiBorrowEvent,
  ApiDepositEvent,
  ApiLiquidateEvent,
  ApiRepayEvent,
  ApiWithdrawEvent,
  Side,
} from "@suilend/sdk/types";

import {
  EventsData,
  TokenAmount,
  getCtokenExchangeRate,
} from "@/components/dashboard/account-details/AccountDetailsDialog";
import EarningsTabAmountChart from "@/components/dashboard/account-details/EarningsTabAmountChart";
import DataTable, { tableHeader } from "@/components/dashboard/DataTable";
import TitleWithIcon from "@/components/shared/TitleWithIcon";
import TokenLogo from "@/components/shared/TokenLogo";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import { AppData, useAppContext } from "@/contexts/AppContext";
import {
  NORMALIZED_SUI_COINTYPE,
  NORMALIZED_USDC_ET_COINTYPE,
  NORMALIZED_USDT_ET_COINTYPE,
} from "@/lib/coinType";
import { EventType, eventSortAsc } from "@/lib/events";
import { formatToken, formatUsd } from "@/lib/format";
import { cn, reserveSort } from "@/lib/utils";

interface RowData {
  coinType: string;
  interest: BigNumber;
  rewards: Record<string, Record<string, BigNumber>>;
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
  const NET = "net";

  const depositsMap = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const map: Record<string, Record<string, BigNumber>> = {};
    const events = [
      ...eventsData.deposit.map((event) => ({
        ...event,
        eventType: EventType.DEPOSIT,
      })),
      ...eventsData.withdraw.map((event) => ({
        ...event,
        eventType: EventType.WITHDRAW,
      })),
      ...eventsData.liquidate.map((event) => ({
        ...event,
        eventType: EventType.LIQUIDATE,
      })),
    ].sort(eventSortAsc);

    events.forEach((event) => {
      if (event.eventType === EventType.DEPOSIT) {
        const depositEvent = event as ApiDepositEvent;

        const reserveAssetDataEvent = eventsData.reserveAssetData.find(
          (e) => e.digest === depositEvent.digest,
        );
        if (!reserveAssetDataEvent) return;

        map[depositEvent.coinType] = map[depositEvent.coinType] ?? {};
        map[depositEvent.coinType][NET] =
          map[depositEvent.coinType][NET] ?? new BigNumber(0);

        const coinMetadata = data.coinMetadataMap[depositEvent.coinType];
        const amount = new BigNumber(depositEvent.ctokenAmount)
          .times(getCtokenExchangeRate(reserveAssetDataEvent))
          .div(10 ** coinMetadata.decimals);

        map[depositEvent.coinType][NET] =
          map[depositEvent.coinType][NET].plus(amount);
        map[depositEvent.coinType][depositEvent.timestamp] =
          map[depositEvent.coinType][NET];
      } else if (event.eventType === EventType.WITHDRAW) {
        const withdrawEvent = event as ApiWithdrawEvent;

        const reserveAssetDataEvent = eventsData.reserveAssetData.find(
          (e) => e.digest === withdrawEvent.digest,
        );
        if (!reserveAssetDataEvent) return;

        map[withdrawEvent.coinType] = map[withdrawEvent.coinType] ?? {};
        map[withdrawEvent.coinType][NET] =
          map[withdrawEvent.coinType][NET] ?? new BigNumber(0);

        const coinMetadata = data.coinMetadataMap[withdrawEvent.coinType];
        const amount = new BigNumber(withdrawEvent.ctokenAmount)
          .times(getCtokenExchangeRate(reserveAssetDataEvent))
          .div(10 ** coinMetadata.decimals);

        map[withdrawEvent.coinType][NET] =
          map[withdrawEvent.coinType][NET].minus(amount);
        map[withdrawEvent.coinType][withdrawEvent.timestamp] =
          map[withdrawEvent.coinType][NET];
      } else if (event.eventType === EventType.LIQUIDATE) {
        const liquidateEvent = event as ApiLiquidateEvent;

        const reserveAssetDataEvent = eventsData.reserveAssetData.find(
          (e) => e.digest === liquidateEvent.digest,
        );
        if (!reserveAssetDataEvent) return;

        const withdrawReserve = data.lendingMarket.reserves.find(
          (reserve) => reserve.id === liquidateEvent.withdrawReserveId,
        );
        if (!withdrawReserve) return;

        map[withdrawReserve.coinType] = map[withdrawReserve.coinType] ?? {};
        map[withdrawReserve.coinType][NET] =
          map[withdrawReserve.coinType][NET] ?? new BigNumber(0);

        const withdrawAmount = new BigNumber(liquidateEvent.withdrawAmount)
          .times(getCtokenExchangeRate(reserveAssetDataEvent))
          .div(10 ** withdrawReserve.mintDecimals);

        map[withdrawReserve.coinType][NET] =
          map[withdrawReserve.coinType][NET].minus(withdrawAmount);
        map[withdrawReserve.coinType][liquidateEvent.timestamp] =
          map[withdrawReserve.coinType][NET];
      }
    });

    Object.keys(map).forEach((coinType) => {
      const currentDeposit = obligation.deposits.find(
        (deposit) => deposit.coinType === coinType,
      );

      map[coinType][NET] = map[coinType][NET].minus(
        currentDeposit?.depositedAmount ?? 0,
      );
    });

    return map;
  }, [
    eventsData,
    data.coinMetadataMap,
    data.lendingMarket.reserves,
    obligation.deposits,
  ]);

  const rewardsMap = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const map: {
      deposit: Record<string, Record<string, Record<string, BigNumber>>>;
      borrow: Record<string, Record<string, Record<string, BigNumber>>>;
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

      map[side][reserve.coinType] = map[side][reserve.coinType] ?? {};
      map[side][reserve.coinType][claimRewardEvent.coinType] =
        map[side][reserve.coinType][claimRewardEvent.coinType] ?? {};
      map[side][reserve.coinType][claimRewardEvent.coinType][NET] =
        map[side][reserve.coinType][claimRewardEvent.coinType][NET] ??
        new BigNumber(0);

      map[side][reserve.coinType][claimRewardEvent.coinType][NET] =
        map[side][reserve.coinType][claimRewardEvent.coinType][NET].plus(
          claimedAmount,
        );
      map[side][reserve.coinType][claimRewardEvent.coinType][
        claimRewardEvent.timestamp
      ] = map[side][reserve.coinType][claimRewardEvent.coinType][NET];
    });

    Object.entries(data.rewardMap).forEach(([coinType, rewards]) => {
      [...rewards.deposit, ...rewards.borrow].forEach((reward) => {
        const claimableAmount =
          reward.obligationClaims[obligation.id]?.claimableAmount ??
          new BigNumber(0);
        if (claimableAmount.eq(0)) return;

        const side = reward.stats.side;

        map[side][coinType] = map[side][coinType] ?? {};
        map[side][coinType][reward.stats.rewardCoinType] =
          map[side][coinType][reward.stats.rewardCoinType] ?? {};
        map[side][coinType][reward.stats.rewardCoinType][NET] =
          map[side][coinType][reward.stats.rewardCoinType][NET] ??
          new BigNumber(0);

        map[side][coinType][reward.stats.rewardCoinType][NET] =
          map[side][coinType][reward.stats.rewardCoinType][NET].plus(
            claimableAmount,
          );
      });
    });

    return map;
  }, [
    eventsData,
    data.lendingMarket.reserves,
    data.coinMetadataMap,
    data.rewardMap,
    obligation.id,
  ]);

  const borrowsMap = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const map: Record<string, Record<string, BigNumber>> = {};
    const events = [
      ...eventsData.borrow.map((event) => ({
        ...event,
        eventType: EventType.BORROW,
      })),
      ...eventsData.repay.map((event) => ({
        ...event,
        eventType: EventType.REPAY,
      })),
      ...eventsData.liquidate.map((event) => ({
        ...event,
        eventType: EventType.LIQUIDATE,
      })),
    ].sort(eventSortAsc);

    events.forEach((event) => {
      if (event.eventType === EventType.BORROW) {
        const borrowEvent = event as unknown as ApiBorrowEvent;

        map[borrowEvent.coinType] = map[borrowEvent.coinType] ?? {};
        map[borrowEvent.coinType][NET] =
          map[borrowEvent.coinType][NET] ?? new BigNumber(0);

        const coinMetadata = data.coinMetadataMap[borrowEvent.coinType];
        const incFeesAmount = new BigNumber(borrowEvent.liquidityAmount).div(
          10 ** coinMetadata.decimals,
        );

        map[borrowEvent.coinType][NET] =
          map[borrowEvent.coinType][NET].plus(incFeesAmount);
        map[borrowEvent.coinType][borrowEvent.timestamp] =
          map[borrowEvent.coinType][NET];
      } else if (event.eventType === EventType.REPAY) {
        const repayEvent = event as ApiRepayEvent;

        map[repayEvent.coinType] = map[repayEvent.coinType] ?? {};
        map[repayEvent.coinType][NET] =
          map[repayEvent.coinType][NET] ?? new BigNumber(0);

        const coinMetadata = data.coinMetadataMap[repayEvent.coinType];
        const amount = new BigNumber(repayEvent.liquidityAmount).div(
          10 ** coinMetadata.decimals,
        );

        map[repayEvent.coinType][NET] =
          map[repayEvent.coinType][NET].minus(amount);
        map[repayEvent.coinType][repayEvent.timestamp] =
          map[repayEvent.coinType][NET];
      } else if (event.eventType === EventType.LIQUIDATE) {
        const liquidateEvent = event as ApiLiquidateEvent;

        const reserveAssetDataEvent = eventsData.reserveAssetData.find(
          (e) => e.digest === liquidateEvent.digest,
        );
        if (!reserveAssetDataEvent) return;

        const repayReserve = data.lendingMarket.reserves.find(
          (reserve) => reserve.id === liquidateEvent.repayReserveId,
        );
        if (!repayReserve) return;

        map[repayReserve.coinType] = map[repayReserve.coinType] ?? {};
        map[repayReserve.coinType][NET] =
          map[repayReserve.coinType][NET] ?? new BigNumber(0);

        const repayAmount = new BigNumber(liquidateEvent.repayAmount)
          .times(getCtokenExchangeRate(reserveAssetDataEvent))
          .div(10 ** repayReserve.mintDecimals);

        map[repayReserve.coinType][NET] =
          map[repayReserve.coinType][NET].minus(repayAmount);
        map[repayReserve.coinType][liquidateEvent.timestamp] =
          map[repayReserve.coinType][NET];
      }
    });

    Object.keys(map).forEach((coinType) => {
      const currentBorrow = obligation.borrows.find(
        (borrow) => borrow.coinType === coinType,
      );

      map[coinType][NET] = map[coinType][NET].minus(
        currentBorrow?.borrowedAmount ?? 0,
      );
    });

    return map;
  }, [
    eventsData,
    data.coinMetadataMap,
    data.lendingMarket.reserves,
    obligation.borrows,
  ]);

  // Chart
  const getDepositChartData = useCallback(
    (side: Side) => {
      if (eventsData === undefined) return undefined;

      const events = (
        side === Side.DEPOSIT
          ? [
              ...eventsData.deposit.map((event) => ({
                ...event,
                eventType: EventType.DEPOSIT,
              })),
              ...eventsData.withdraw.map((event) => ({
                ...event,
                eventType: EventType.WITHDRAW,
              })),
              ...eventsData.liquidate.map((event) => ({
                ...event,
                eventType: EventType.LIQUIDATE,
              })),
            ]
          : [
              ...eventsData.borrow.map((event) => ({
                ...event,
                eventType: EventType.BORROW,
              })),
              ...eventsData.repay.map((event) => ({
                ...event,
                eventType: EventType.REPAY,
              })),
              ...eventsData.liquidate.map((event) => ({
                ...event,
                eventType: EventType.LIQUIDATE,
              })),
            ]
      ).sort(eventSortAsc);

      const resultMap: Record<
        string,
        { timestampS: number; amount: number }[]
      > = {};
      const timestampsS: number[] = [];

      events.forEach((event) => {
        const reserveAssetDataEvent = eventsData.reserveAssetData.find(
          (e) => e.digest === event.digest,
        );
        if (!reserveAssetDataEvent) return;

        const obligationDataEvent = eventsData.obligationData.find(
          (e) => e.digest === event.digest,
        );
        if (!obligationDataEvent) return;

        let coinType;
        if (
          [
            EventType.DEPOSIT,
            EventType.BORROW,
            EventType.WITHDRAW,
            EventType.REPAY,
          ].includes(event.eventType)
        ) {
          coinType = (
            event as
              | ApiDepositEvent
              | ApiBorrowEvent
              | ApiWithdrawEvent
              | ApiRepayEvent
          ).coinType;
        } else if (event.eventType === EventType.LIQUIDATE) {
          if (side === Side.DEPOSIT) {
            const withdrawReserve = data.lendingMarket.reserves.find(
              (reserve) =>
                reserve.id === (event as ApiLiquidateEvent).withdrawReserveId,
            );
            if (!withdrawReserve) return;

            coinType = withdrawReserve.coinType;
          } else {
            const repayReserve = data.lendingMarket.reserves.find(
              (reserve) =>
                reserve.id === (event as ApiLiquidateEvent).repayReserveId,
            );
            if (!repayReserve) return;

            coinType = repayReserve.coinType;
          }
        }
        if (!coinType) return;
        const coinMetadata = data.coinMetadataMap[coinType];

        let amount;
        const position = JSON.parse(
          side === Side.DEPOSIT
            ? obligationDataEvent.depositsJson
            : obligationDataEvent.borrowsJson,
        ).find((p: any) => normalizeStructTag(p.coin_type.name) === coinType);
        if (!position) {
          amount = 0;
        } else {
          if (side === Side.DEPOSIT) {
            const depositedAmount = new BigNumber(
              position.deposited_ctoken_amount,
            )
              .times(getCtokenExchangeRate(reserveAssetDataEvent))
              .div(10 ** coinMetadata.decimals);
            amount = depositedAmount;
          } else {
            const incFeesAmount = new BigNumber(position.borrowed_amount.value)
              .div(WAD)
              .div(10 ** coinMetadata.decimals);
            amount = incFeesAmount;
          }
        }

        resultMap[coinType] = resultMap[coinType] ?? [];
        resultMap[coinType].push({
          timestampS: obligationDataEvent.timestamp,
          amount: +amount,
        });
        timestampsS.push(obligationDataEvent.timestamp);
      });

      const nowS = Math.floor(new Date().getTime() / 1000);
      Object.keys(resultMap).forEach((coinType) => {
        resultMap[coinType].push({
          timestampS: nowS,
          amount: resultMap[coinType][resultMap[coinType].length - 1].amount,
        });
        timestampsS.push(nowS);
      });

      const result = [];
      for (const timestampS of Array.from(new Set(timestampsS))) {
        result.push({
          timestampS,
          amountSui:
            resultMap[NORMALIZED_SUI_COINTYPE]?.findLast(
              (e) => e.timestampS <= timestampS,
            )?.amount ?? 0,
          amountUsdc:
            resultMap[NORMALIZED_USDC_ET_COINTYPE]?.findLast(
              (e) => e.timestampS <= timestampS,
            )?.amount ?? 0,
          amountUsdt:
            resultMap[NORMALIZED_USDT_ET_COINTYPE]?.findLast(
              (e) => e.timestampS <= timestampS,
            )?.amount ?? 0,
        });
      }

      return result;
    },
    [eventsData, data.lendingMarket.reserves, data.coinMetadataMap],
  );

  const depositsChartData = useMemo(
    () => getDepositChartData(Side.DEPOSIT),
    [getDepositChartData],
  );
  const borrowsChartData = useMemo(
    () => getDepositChartData(Side.BORROW),
    [getDepositChartData],
  );

  // Totals
  const totalInterestEarnedUsd = useMemo(() => {
    if (depositsMap === undefined) return undefined;

    return Object.keys(depositsMap).reduce((acc, coinType) => {
      const reserve = data.reserveMap[coinType];
      if (!reserve) return acc;

      return acc.plus(
        depositsMap[coinType][NET].times(-1).times(reserve.price),
      );
    }, new BigNumber(0));
  }, [depositsMap, data.reserveMap]);

  const totalRewardsEarnedUsd = useMemo(() => {
    if (rewardsMap === undefined) return undefined;

    let result = new BigNumber(0);
    Object.values(rewardsMap).forEach((sideRewards) => {
      Object.values(sideRewards).forEach((reserveRewards) => {
        Object.keys(reserveRewards).forEach((rewardCoinType) => {
          const reserve = data.reserveMap[rewardCoinType];
          if (!reserve) return;

          result = result.plus(
            reserveRewards[rewardCoinType][NET].times(reserve.price),
          );
        });
      });
    });

    return result;
  }, [rewardsMap, data.reserveMap]);

  const totalInterestPaidUsd = useMemo(() => {
    if (borrowsMap === undefined) return undefined;

    return Object.keys(borrowsMap).reduce((acc, coinType) => {
      const reserve = data.reserveMap[coinType];
      if (!reserve) return acc;

      return acc.plus(borrowsMap[coinType][NET].times(-1).times(reserve.price));
    }, new BigNumber(0));
  }, [borrowsMap, data.reserveMap]);

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
              {Object.keys(rewards)
                .sort((a, b) => (a[0] > b[0] ? -1 : 1))
                .map((coinType) => {
                  const coinMetadata = data.coinMetadataMap[coinType];

                  return (
                    <TokenAmount
                      key={coinType}
                      amount={rewards[coinType][NET]}
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
      depositsMap === undefined ||
      rewardsMap === undefined ||
      borrowsMap === undefined
    )
      return undefined;

    const depositKeys = Array.from(
      new Set([
        ...Object.keys(depositsMap),
        ...Object.keys(rewardsMap.deposit),
      ]),
    );
    const borrowKeys = Array.from(
      new Set([...Object.keys(borrowsMap), ...Object.keys(rewardsMap.borrow)]),
    );

    const depositRows = depositKeys
      .reduce(
        (acc: RowData[], coinType) => [
          ...acc,
          {
            coinType,
            interest:
              depositsMap[coinType]?.[NET].times(-1) ?? new BigNumber(0),
            rewards: rewardsMap.deposit[coinType] ?? {},
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
            interest: borrowsMap[coinType]?.[NET].times(-1) ?? new BigNumber(0),
            rewards: rewardsMap.borrow[coinType] ?? {},
          } as RowData,
        ],
        [],
      )
      .sort((a, b) =>
        reserveSort(data.reserveMap[a.coinType], data.reserveMap[b.coinType]),
      );

    return { deposit: depositRows, borrow: borrowRows };
  }, [depositsMap, rewardsMap, borrowsMap, data.reserveMap]);

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
          <Skeleton className="h-[calc((4px+10px+4px+10px+4px)*4)] w-full bg-muted/10 md:h-[calc((4px+10px+4px)*4)]" />
        )}

        <TLabelSans className="px-4">
          Note: USD values of earnings are calculated using current prices.
        </TLabelSans>
      </div>

      {[
        {
          side: Side.DEPOSIT,
          titleIcon: <PiggyBank />,
          title: "Assets deposited",
          columns: depositColumns,
          data: rows?.deposit,
          noDataMessage: "No deposits",
        },
        {
          side: Side.BORROW,
          titleIcon: <HandCoins />,
          title: "Assets borrowed",
          columns: borrowColumns,
          data: rows?.borrow,
          noDataMessage: "No borrows",
        },
      ].map((table) => (
        <div key={table.title} className="flex flex-col gap-4">
          <TitleWithIcon className="px-4" icon={table.titleIcon}>
            {table.title}
          </TitleWithIcon>

          <EarningsTabAmountChart
            side={table.side}
            isLoading={
              (table.side === Side.DEPOSIT
                ? depositsChartData
                : borrowsChartData) === undefined
            }
            data={
              (table.side === Side.DEPOSIT
                ? depositsChartData
                : borrowsChartData) ?? []
            }
          />

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
