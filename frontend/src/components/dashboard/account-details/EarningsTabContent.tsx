import { useCallback, useMemo, useRef } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import { HandCoins, PiggyBank } from "lucide-react";

import { ParsedObligation } from "@suilend/sdk/parsers/obligation";
import {
  ApiBorrowEvent,
  ApiDepositEvent,
  ApiLiquidateEvent,
  ApiObligationDataEvent,
  ApiRepayEvent,
  ApiReserveAssetDataEvent,
  ApiWithdrawEvent,
  Side,
} from "@suilend/sdk/types";

import {
  EventsData,
  TokenAmount,
  getCtokenExchangeRate,
} from "@/components/dashboard/account-details/AccountDetailsDialog";
import EarningsChart, {
  ChartData,
} from "@/components/dashboard/account-details/EarningsChart";
import DataTable, { tableHeader } from "@/components/dashboard/DataTable";
import TitleWithIcon from "@/components/shared/TitleWithIcon";
import TokenLogo from "@/components/shared/TokenLogo";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { msPerYear } from "@/lib/constants";
import { EventType, eventSortAsc } from "@/lib/events";
import { formatToken, formatUsd } from "@/lib/format";
import { cn, reserveSort } from "@/lib/utils";

import { WAD } from "../../../../../sdk/src/core/constants";

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

  type CumInterestMap = Record<
    string,
    { timestampS: number; cumInterest: number }[]
  >;

  type PrevEventsMap = Record<
    string,
    {
      obligationDataEvent: ApiObligationDataEvent;
      reserveAssetDataEvent: ApiReserveAssetDataEvent;
    }
  >;

  const nowSRef = useRef<number>(Math.floor(new Date().getTime() / 1000));

  // Interest earned
  const getInterestEarned = useCallback(
    (
      coinType: string,
      decimals: number,
      timestampS: number,
      ctokenExchangeRate: BigNumber,
      prevObligationDataEvent: ApiObligationDataEvent,
      prevReserveAssetDataEvent: ApiReserveAssetDataEvent,
    ) => {
      const prevCtokenExchangeRate = getCtokenExchangeRate(
        prevReserveAssetDataEvent,
      );

      const proportionOfYear = new BigNumber(
        timestampS - prevReserveAssetDataEvent.timestamp,
      ).div(msPerYear / 1000);
      const annualizedInterestRate = new BigNumber(ctokenExchangeRate)
        .div(prevCtokenExchangeRate)
        .minus(1)
        .div(proportionOfYear);

      const prevPosition = JSON.parse(
        prevObligationDataEvent.depositsJson,
      ).find((p: any) => normalizeStructTag(p.coin_type.name) === coinType);
      const prevDepositedAmount = !prevPosition
        ? new BigNumber(0)
        : new BigNumber(prevPosition.deposited_ctoken_amount)
            .times(prevCtokenExchangeRate)
            .div(10 ** decimals);

      const interestEarned = prevDepositedAmount
        .times(annualizedInterestRate)
        .times(proportionOfYear);

      return interestEarned;
    },
    [],
  );

  const cumInterestEarnedMap = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const resultMap: CumInterestMap = {};
    const prevEventsMap: PrevEventsMap = {};

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
      const obligationDataEvent = eventsData.obligationData.find(
        (e) => e.digest === event.digest,
      );
      if (!obligationDataEvent) return;

      let coinType;
      if (event.eventType === EventType.DEPOSIT) {
        coinType = (event as ApiDepositEvent).coinType;
      } else if (event.eventType === EventType.WITHDRAW) {
        coinType = (event as ApiWithdrawEvent).coinType;
      } else if (event.eventType === EventType.LIQUIDATE) {
        const withdrawReserve = data.lendingMarket.reserves.find(
          (reserve) =>
            reserve.id === (event as ApiLiquidateEvent).withdrawReserveId,
        );
        if (!withdrawReserve) return;

        coinType = withdrawReserve.coinType;
      }
      if (!coinType) return;
      const coinMetadata = data.coinMetadataMap[coinType];

      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === event.digest && e.coinType === coinType,
      );
      if (!reserveAssetDataEvent) return;

      if (!prevEventsMap[coinType]) {
        resultMap[coinType] = resultMap[coinType] ?? [];
        resultMap[coinType].push({
          timestampS: obligationDataEvent.timestamp,
          cumInterest: 0,
        });
      } else {
        const interestEarned = getInterestEarned(
          coinType,
          coinMetadata.decimals,
          reserveAssetDataEvent.timestamp,
          getCtokenExchangeRate(reserveAssetDataEvent),
          prevEventsMap[coinType].obligationDataEvent,
          prevEventsMap[coinType].reserveAssetDataEvent,
        );

        resultMap[coinType] = resultMap[coinType] ?? [];
        resultMap[coinType].push({
          timestampS: obligationDataEvent.timestamp,
          cumInterest: +interestEarned.plus(
            resultMap[coinType][resultMap[coinType].length - 1].cumInterest,
          ),
        });
      }

      prevEventsMap[coinType] = { obligationDataEvent, reserveAssetDataEvent };
    });

    Object.keys(resultMap).forEach((coinType) => {
      const reserve = data.reserveMap[coinType];
      if (!reserve) return;

      const interestEarned = getInterestEarned(
        coinType,
        reserve.mintDecimals,
        nowSRef.current,
        reserve.cTokenExchangeRate,
        prevEventsMap[coinType].obligationDataEvent,
        prevEventsMap[coinType].reserveAssetDataEvent,
      );

      resultMap[coinType].push({
        timestampS: nowSRef.current,
        cumInterest: +interestEarned.plus(
          resultMap[coinType][resultMap[coinType].length - 1].cumInterest,
        ),
      });
    });

    return resultMap;
  }, [
    eventsData,
    data.lendingMarket.reserves,
    data.coinMetadataMap,
    getInterestEarned,
    data.reserveMap,
  ]);

  // Interest paid
  const getInterestPaid = useCallback(
    (
      coinType: string,
      decimals: number,
      timestampS: number,
      cumulativeBorrowRate: BigNumber,
      prevObligationDataEvent: ApiObligationDataEvent,
      prevReserveAssetDataEvent: ApiReserveAssetDataEvent,
    ) => {
      const prevCumulativeBorrowRate = new BigNumber(
        prevReserveAssetDataEvent.cumulativeBorrowRate,
      ).div(WAD);

      const proportionOfYear = new BigNumber(
        timestampS - prevReserveAssetDataEvent.timestamp,
      ).div(msPerYear / 1000);
      const annualizedInterestRate = new BigNumber(cumulativeBorrowRate)
        .div(prevCumulativeBorrowRate)
        .minus(1)
        .div(proportionOfYear);

      const prevPosition = JSON.parse(prevObligationDataEvent.borrowsJson).find(
        (p: any) => normalizeStructTag(p.coin_type.name) === coinType,
      );
      const prevBorrowedAmount = !prevPosition
        ? new BigNumber(0)
        : new BigNumber(prevPosition.borrowed_amount.value)
            .div(WAD)
            .div(10 ** decimals);

      const interestPaid = prevBorrowedAmount
        .times(annualizedInterestRate)
        .times(proportionOfYear);

      return interestPaid;
    },
    [],
  );

  const cumInterestPaidMap = useMemo(() => {
    if (eventsData === undefined) return undefined;

    const resultMap: CumInterestMap = {};
    const prevEventsMap: PrevEventsMap = {};

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
      const obligationDataEvent = eventsData.obligationData.find(
        (e) => e.digest === event.digest,
      );
      if (!obligationDataEvent) return;

      let coinType;
      if (event.eventType === EventType.BORROW) {
        coinType = (event as unknown as ApiBorrowEvent).coinType;
      } else if (event.eventType === EventType.REPAY) {
        coinType = (event as ApiRepayEvent).coinType;
      } else if (event.eventType === EventType.LIQUIDATE) {
        const repayReserve = data.lendingMarket.reserves.find(
          (reserve) =>
            reserve.id === (event as ApiLiquidateEvent).repayReserveId,
        );
        if (!repayReserve) return;

        coinType = repayReserve.coinType;
      }
      if (!coinType) return;
      const coinMetadata = data.coinMetadataMap[coinType];

      const reserveAssetDataEvent = eventsData.reserveAssetData.find(
        (e) => e.digest === event.digest && e.coinType === coinType,
      );
      if (!reserveAssetDataEvent) return;

      if (!prevEventsMap[coinType]) {
        resultMap[coinType] = resultMap[coinType] ?? [];
        resultMap[coinType].push({
          timestampS: obligationDataEvent.timestamp,
          cumInterest: 0,
        });
      } else {
        const interestPaid = getInterestPaid(
          coinType,
          coinMetadata.decimals,
          reserveAssetDataEvent.timestamp,
          new BigNumber(reserveAssetDataEvent.cumulativeBorrowRate).div(WAD),
          prevEventsMap[coinType].obligationDataEvent,
          prevEventsMap[coinType].reserveAssetDataEvent,
        );

        resultMap[coinType] = resultMap[coinType] ?? [];
        resultMap[coinType].push({
          timestampS: obligationDataEvent.timestamp,
          cumInterest: +interestPaid.plus(
            resultMap[coinType][resultMap[coinType].length - 1].cumInterest,
          ),
        });
      }

      prevEventsMap[coinType] = { obligationDataEvent, reserveAssetDataEvent };
    });

    Object.keys(resultMap).forEach((coinType) => {
      const reserve = data.reserveMap[coinType];
      if (!reserve) return;

      const interestPaid = getInterestPaid(
        reserve.coinType,
        reserve.mintDecimals,
        nowSRef.current,
        new BigNumber(reserve.cumulativeBorrowRate),
        prevEventsMap[coinType].obligationDataEvent,
        prevEventsMap[coinType].reserveAssetDataEvent,
      );

      resultMap[coinType].push({
        timestampS: nowSRef.current,
        cumInterest: +interestPaid.plus(
          resultMap[coinType][resultMap[coinType].length - 1].cumInterest,
        ),
      });
    });

    return resultMap;
  }, [
    eventsData,
    data.lendingMarket.reserves,
    data.coinMetadataMap,
    getInterestPaid,
    data.reserveMap,
  ]);

  // Rewards
  const NET = "net";

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

  // Chart
  const getInterpolatedCumInterestData = useCallback(
    (cumInterestMap?: CumInterestMap) => {
      if (cumInterestMap === undefined) return undefined;

      const coinTypes = Object.keys(cumInterestMap).sort((a, b) =>
        reserveSort(data.reserveMap[a], data.reserveMap[b]),
      );
      const timestampsS = Array.from(
        new Set(
          Object.values(cumInterestMap)
            .map((chartData) => chartData.map((d) => d.timestampS).flat())
            .flat(),
        ),
      ).sort((a, b) => a - b);

      const result: ChartData[] = [];
      for (const timestampS of timestampsS) {
        const d: ChartData = coinTypes.reduce(
          (acc, coinType) => ({
            ...acc,
            [coinType]:
              cumInterestMap[coinType].findLast(
                (e) => e.timestampS <= timestampS,
              )?.cumInterest ?? 0,
          }),
          { timestampS },
        );
        result.push(d);
      }

      return result;
    },
    [data.reserveMap],
  );

  const interpolatedCumInterestEarnedData = useMemo(
    () => getInterpolatedCumInterestData(cumInterestEarnedMap),
    [getInterpolatedCumInterestData, cumInterestEarnedMap],
  );

  const interpolatedCumInterestPaidData = useMemo(
    () => getInterpolatedCumInterestData(cumInterestPaidMap),
    [getInterpolatedCumInterestData, cumInterestPaidMap],
  );

  // Usd
  const getCumInterestUsd = useCallback(
    (cumInterestMap?: CumInterestMap) => {
      if (cumInterestMap === undefined) return undefined;

      return Object.keys(cumInterestMap).reduce((acc, coinType) => {
        const reserve = data.reserveMap[coinType];
        if (!reserve) return acc;

        const d = cumInterestMap[coinType].find(
          (d) => d.timestampS === nowSRef.current,
        );
        if (!d) return acc;

        const cumInterestUsd = new BigNumber(d.cumInterest).times(
          reserve.price,
        );
        return acc.plus(cumInterestUsd);
      }, new BigNumber(0));
    },
    [data.reserveMap],
  );

  const cumInterestEarnedUsd = useMemo(
    () => getCumInterestUsd(cumInterestEarnedMap),
    [getCumInterestUsd, cumInterestEarnedMap],
  );

  const cumInterestPaidUsd = useMemo(
    () => getCumInterestUsd(cumInterestPaidMap),
    [getCumInterestUsd, cumInterestPaidMap],
  );

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

  const totalEarningsUsd = useMemo(() => {
    if (
      cumInterestEarnedUsd === undefined ||
      cumInterestPaidUsd === undefined ||
      totalRewardsEarnedUsd === undefined
    )
      return undefined;

    return cumInterestEarnedUsd
      .minus(cumInterestEarnedUsd)
      .plus(totalRewardsEarnedUsd);
  }, [cumInterestEarnedUsd, cumInterestPaidUsd, totalRewardsEarnedUsd]);

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
      cumInterestEarnedMap === undefined ||
      rewardsMap === undefined ||
      cumInterestPaidMap === undefined
    )
      return undefined;

    const depositKeys = Array.from(
      new Set([
        ...Object.keys(cumInterestEarnedMap),
        ...Object.keys(rewardsMap.deposit),
      ]),
    );
    const borrowKeys = Array.from(
      new Set([
        ...Object.keys(cumInterestPaidMap),
        ...Object.keys(rewardsMap.borrow),
      ]),
    );

    const depositRows = depositKeys
      .reduce(
        (acc: RowData[], coinType) => [
          ...acc,
          {
            coinType,
            interest: new BigNumber(
              cumInterestEarnedMap[coinType]?.find(
                (d) => d.timestampS === nowSRef.current,
              )?.cumInterest ?? 0,
            ),
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
            interest: new BigNumber(
              cumInterestPaidMap[coinType]?.find(
                (d) => d.timestampS === nowSRef.current,
              )?.cumInterest ?? 0,
            ),
            rewards: rewardsMap.borrow[coinType] ?? {},
          } as RowData,
        ],
        [],
      )
      .sort((a, b) =>
        reserveSort(data.reserveMap[a.coinType], data.reserveMap[b.coinType]),
      );

    return { deposit: depositRows, borrow: borrowRows };
  }, [cumInterestEarnedMap, rewardsMap, cumInterestPaidMap, data.reserveMap]);

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto overflow-x-hidden">
      <div className="flex flex-col gap-2">
        {totalEarningsUsd !== undefined &&
        cumInterestEarnedUsd !== undefined &&
        cumInterestPaidUsd !== undefined &&
        totalRewardsEarnedUsd !== undefined ? (
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
              <Tooltip title={formatUsd(cumInterestEarnedUsd, { exact: true })}>
                <TBody className="text-center">
                  {formatUsd(cumInterestEarnedUsd)}
                </TBody>
              </Tooltip>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1">
              <TLabelSans className="text-center">Interest paid</TLabelSans>
              <Tooltip title={formatUsd(cumInterestPaidUsd, { exact: true })}>
                <TBody className="text-right">
                  {formatUsd(cumInterestPaidUsd)}
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

          <EarningsChart
            side={table.side}
            isLoading={
              (table.side === Side.DEPOSIT
                ? interpolatedCumInterestEarnedData
                : interpolatedCumInterestPaidData) === undefined
            }
            data={
              (table.side === Side.DEPOSIT
                ? interpolatedCumInterestEarnedData
                : interpolatedCumInterestPaidData) ?? []
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
