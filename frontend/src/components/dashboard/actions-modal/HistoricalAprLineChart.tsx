import { useEffect, useMemo, useRef } from "react";

import BigNumber from "bignumber.js";
import { format } from "date-fns";
import { capitalize } from "lodash";
import * as Recharts from "recharts";
import { Coordinate } from "recharts/types/util/types";
import { useLocalStorage } from "usehooks-ts";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import AprRewardsBreakdownRow from "@/components/dashboard/AprRewardsBreakdownRow";
import Button from "@/components/shared/Button";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TBodySans, TLabelSans } from "@/components/shared/Typography";
import { ViewBox, getTooltipStyle } from "@/components/ui/chart";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import useIsTouchscreen from "@/hooks/useIsTouchscreen";
import {
  COIN_TYPE_COLOR_MAP,
  LOGO_MAP,
  NORMALIZED_SUI_COINTYPE,
} from "@/lib/coinType";
import {
  DAYS,
  DAY_S,
  Days,
  RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP,
  calculateSuiRewardsDepositAprPercent,
} from "@/lib/events";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type AprFields =
  | "depositAprPercent"
  | "depositSuiRewardsAprPercent"
  | "borrowAprPercent";
const aprFields: AprFields[] = [
  "depositAprPercent",
  "depositSuiRewardsAprPercent",
  "borrowAprPercent",
];

type ChartData = {
  timestampS: number;
} & {
  [key in AprFields]?: number;
};

interface TooltipContentProps {
  side: Side;
  d: ChartData;
  viewBox: ViewBox;
  coordinate?: Partial<Coordinate>;
}

function TooltipContent({ side, d, viewBox, coordinate }: TooltipContentProps) {
  if (!coordinate?.x || !viewBox) return null;
  if (
    (side === Side.DEPOSIT && d.depositAprPercent === undefined) ||
    (side === Side.BORROW && d.borrowAprPercent === undefined)
  )
    return null;
  return (
    // Subset of TooltipContent className
    <div
      className="absolute rounded-md border bg-popover px-3 py-1.5 shadow-md"
      style={getTooltipStyle(
        side === Side.DEPOSIT ? 240 : 200,
        viewBox,
        coordinate,
      )}
    >
      <div className="flex w-full flex-col gap-2">
        <TLabelSans>
          {format(new Date(d.timestampS * 1000), "MM/dd HH:mm")}
        </TLabelSans>

        <div className="flex w-full flex-row items-center justify-between gap-4">
          <TBodySans>{capitalize(side)} APR</TBodySans>
          <TBody>
            {formatPercent(
              new BigNumber(
                side === Side.DEPOSIT
                  ? (d.depositAprPercent as number) +
                    (d.depositSuiRewardsAprPercent ?? 0)
                  : (d.borrowAprPercent as number),
              ),
            )}
          </TBody>
        </div>

        <AprRewardsBreakdownRow
          isLast={
            !(
              side === Side.DEPOSIT &&
              d.depositSuiRewardsAprPercent !== undefined
            )
          }
          value={
            <span className="text-success">
              {formatPercent(
                new BigNumber(
                  (side === Side.DEPOSIT
                    ? d.depositAprPercent
                    : d.borrowAprPercent) as number,
                ),
              )}
            </span>
          }
        >
          <TLabelSans>Interest</TLabelSans>
        </AprRewardsBreakdownRow>

        {side === Side.DEPOSIT &&
          d.depositSuiRewardsAprPercent !== undefined && (
            <AprRewardsBreakdownRow
              isLast
              value={
                <span
                  style={{
                    color: COIN_TYPE_COLOR_MAP[NORMALIZED_SUI_COINTYPE],
                  }}
                >
                  {formatPercent(new BigNumber(d.depositSuiRewardsAprPercent))}
                </span>
              }
            >
              <TLabelSans>Rewards in</TLabelSans>
              <TokenLogo
                className="h-4 w-4"
                coinType={NORMALIZED_SUI_COINTYPE}
                symbol="SUI"
                src={LOGO_MAP[NORMALIZED_SUI_COINTYPE]}
              />
              <TLabelSans>SUI</TLabelSans>
            </AprRewardsBreakdownRow>
          )}
      </div>
    </div>
  );
}

interface ChartProps {
  side: Side;
  data: ChartData[];
}

function Chart({ side, data }: ChartProps) {
  const { sm } = useBreakpoint();
  const isTouchscreen = useIsTouchscreen();

  const sampleIntervalS =
    data.length > 0 ? data[1].timestampS - data[0].timestampS : 1;
  const samplesPerDay = DAY_S / sampleIntervalS;
  const days = data.length / samplesPerDay;

  // Max
  const maxY = Math.max(
    ...(data
      .map((d) =>
        side === Side.DEPOSIT
          ? (d.depositAprPercent ?? 0) + (d.depositSuiRewardsAprPercent ?? 0)
          : d.borrowAprPercent,
      )
      .filter(Boolean) as number[]),
  );

  // Ticks
  const ticksX = useMemo(() => {
    return data
      .filter((d) => {
        if (days === 1) return d.timestampS % ((sm ? 4 : 8) * 60 * 60) === 0;
        if (days === 7) return d.timestampS % ((sm ? 1 : 2) * DAY_S) === 0;
        if (days === 30) return d.timestampS % ((sm ? 5 : 10) * DAY_S) === 0;
        return false;
      })
      .map((d) => {
        if (days === 1) return d.timestampS;
        return d.timestampS + new Date().getTimezoneOffset() * 60;
      });
  }, [data, days, sm]);
  const ticksY = Array.from({ length: 4 }).map(
    (_, index, array) => Math.ceil(maxY / (array.length - 1)) * index,
  );

  const tickFormatterX = (timestampS: number) => {
    if (days === 1) return format(new Date(timestampS * 1000), "HH:mm");
    return format(new Date(timestampS * 1000), "MM/dd");
  };
  const tickFormatterY = (value: number) => value.toString();

  const tickMargin = 2;
  const tick = {
    fontSize: 11,
    fontFamily: "var(--font-geist-sans)",
    fill: "hsl(var(--muted-foreground))",
  };
  const tickLine = {
    stroke: "transparent",
  };

  // Domain
  const domainX = [
    Math.min(...data.map((d) => d.timestampS)),
    Math.max(...data.map((d) => d.timestampS)),
  ];
  const domainY = [0, maxY];

  return (
    <Recharts.ResponsiveContainer
      width="100%"
      height="100%"
      data-loading={data.length > 0}
    >
      <Recharts.AreaChart
        data={data}
        margin={{ top: 8, right: 16, bottom: -12, left: -5 }}
      >
        <Recharts.CartesianGrid
          strokeDasharray="1 4"
          stroke="hsla(var(--secondary) / 20%)"
          fill="transparent"
        />
        <Recharts.XAxis
          type="number"
          dataKey="timestampS"
          ticks={ticksX}
          tickMargin={tickMargin}
          tick={tick}
          axisLine={{
            stroke: "hsl(209 36% 28%)", // 25% var(--secondary) on var(--popover)
          }}
          tickLine={tickLine}
          tickFormatter={tickFormatterX}
          domain={domainX}
        />
        <Recharts.YAxis
          type="number"
          ticks={ticksY}
          tickMargin={tickMargin}
          tick={tick}
          axisLine={{
            stroke: "hsl(209 36% 28%)", // 25% var(--secondary) on var(--popover)
          }}
          tickLine={tickLine}
          tickFormatter={tickFormatterY}
          domain={domainY}
          unit="%"
        >
          <Recharts.Label
            value={`${capitalize(side)} APR`}
            style={{
              fontSize: 12,
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 400,
              lineHeight: "12px",
              textAnchor: "middle",
              fill: "hsl(var(--muted-foreground))",
            }}
            position="insideLeft"
            angle={-90}
            offset={5 + 5}
          />
        </Recharts.YAxis>
        <Recharts.Area
          type="monotone"
          stackId="1"
          dataKey={
            side === Side.DEPOSIT ? "depositAprPercent" : "borrowAprPercent"
          }
          isAnimationActive={false}
          stroke="hsl(var(--success))"
          fill="hsla(var(--success) / 10%)"
          fillOpacity={1}
          dot={{
            stroke: "transparent",
            strokeWidth: 0,
            fill: "transparent",
          }}
          strokeWidth={2}
        />
        {side === Side.DEPOSIT && (
          <Recharts.Area
            type="monotone"
            stackId="1"
            dataKey="depositSuiRewardsAprPercent"
            isAnimationActive={false}
            stroke={COIN_TYPE_COLOR_MAP[NORMALIZED_SUI_COINTYPE]}
            fill={COIN_TYPE_COLOR_MAP[NORMALIZED_SUI_COINTYPE]}
            fillOpacity={0.1}
            dot={{
              stroke: "transparent",
              strokeWidth: 0,
              fill: "transparent",
            }}
            strokeWidth={1.5}
          />
        )}
        {data.length > 0 && (
          <Recharts.Tooltip
            isAnimationActive={false}
            filterNull={false}
            cursor={{
              stroke: "hsl(var(--foreground))",
              strokeWidth: 2,
            }}
            trigger={isTouchscreen ? "hover" : "hover"}
            wrapperStyle={{
              transform: undefined,
              position: undefined,
              top: undefined,
              left: undefined,
            }}
            content={({ active, payload, viewBox, coordinate }) => {
              if (!active || !payload?.[0]?.payload) return null;
              return (
                <TooltipContent
                  side={side}
                  d={payload[0].payload as ChartData}
                  viewBox={viewBox as any}
                  coordinate={coordinate}
                />
              );
            }}
          />
        )}
      </Recharts.AreaChart>
    </Recharts.ResponsiveContainer>
  );
}

interface HistoricalAprLineChartProps {
  reserve: ParsedReserve;
  side: Side;
}

export default function HistoricalAprLineChart({
  reserve,
  side,
}: HistoricalAprLineChartProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const { reserveAssetDataEventsMap, fetchReserveAssetDataEvents } =
    useDashboardContext();

  // Events
  const [days, setDays] = useLocalStorage<Days>(
    "historicalAprLineChartDays",
    7,
  );

  const suiReserve = data.reserveMap[NORMALIZED_SUI_COINTYPE];

  const didFetchInitialReserveAssetDataEventsRef = useRef<boolean>(false);
  const didFetchInitialSuiReserveAssetDataEventsRef = useRef<boolean>(false);
  useEffect(() => {
    const events = reserveAssetDataEventsMap?.[reserve.id]?.[days];
    if (events === undefined) {
      if (didFetchInitialReserveAssetDataEventsRef.current) return;

      fetchReserveAssetDataEvents(reserve, days);
      didFetchInitialReserveAssetDataEventsRef.current = true;
    }

    if (reserve.id === suiReserve.id) return;
    const suiEvents = reserveAssetDataEventsMap?.[suiReserve.id]?.[days];
    if (suiEvents === undefined) {
      if (didFetchInitialSuiReserveAssetDataEventsRef.current) return;

      fetchReserveAssetDataEvents(suiReserve, days);
      didFetchInitialSuiReserveAssetDataEventsRef.current = true;
    }
  }, [
    reserveAssetDataEventsMap,
    reserve,
    days,
    fetchReserveAssetDataEvents,
    suiReserve,
  ]);

  const onDaysClick = (value: Days) => {
    setDays(value);

    const events = reserveAssetDataEventsMap?.[reserve.id]?.[value];
    if (events === undefined) fetchReserveAssetDataEvents(reserve, value);

    if (reserve.id === suiReserve.id) return;
    const suiEvents = reserveAssetDataEventsMap?.[suiReserve.id]?.[value];
    if (suiEvents === undefined) fetchReserveAssetDataEvents(suiReserve, value);
  };

  // Data
  const chartData = useMemo(() => {
    const events = reserveAssetDataEventsMap?.[reserve.id]?.[days];
    if (events === undefined) return;

    const suiEvents = reserveAssetDataEventsMap?.[suiReserve.id]?.[days];
    if (suiEvents === undefined) return;

    // Data
    const sampleIntervalS = RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP[days];

    const daysS = days * DAY_S;
    const n = daysS / sampleIntervalS;

    const lastTimestampS =
      Date.now() / 1000 - ((Date.now() / 1000) % sampleIntervalS);
    const timestampsS = Array.from({ length: n })
      .map((_, index) => lastTimestampS - index * sampleIntervalS)
      .reverse();

    const result: ChartData[] = [];
    timestampsS.forEach((timestampS) => {
      const event = events.findLast((e) => e.sampleTimestampS <= timestampS);
      result.push({
        timestampS,
        depositAprPercent: event ? +event.depositAprPercent : undefined,
        depositSuiRewardsAprPercent: event
          ? calculateSuiRewardsDepositAprPercent(event, suiEvents, reserve)
          : undefined,
        borrowAprPercent: event ? +event.borrowAprPercent : undefined,
      });
    });

    for (const d of result) {
      let hasUndefined = false;
      for (const field of aprFields) {
        if (d[field] === undefined) {
          d[field] = result.find((_d) => _d[field] !== undefined)?.[field];
          hasUndefined = true;
        }
      }
      if (!hasUndefined) break;
    }

    return result;
  }, [reserveAssetDataEventsMap, reserve, days, suiReserve.id]);
  const isLoading = chartData === undefined;

  return (
    <div className="-mr-4 flex flex-col items-end">
      <div className="relative z-[2] -mb-1 -mt-2 flex flex-row pr-4 md:-mt-1">
        {DAYS.map((_days) => (
          <Button
            key={_days}
            className="px-2 text-muted-foreground"
            labelClassName={cn(
              "text-xs font-sans uppercase",
              days === _days && "text-primary-foreground",
            )}
            variant="ghost"
            size="sm"
            onClick={() => onDaysClick(_days)}
          >
            {_days}d
          </Button>
        ))}
      </div>

      <div
        className="historical-apr-line-chart h-[140px] w-full flex-shrink-0 transform-gpu md:h-[160px]"
        is-loading={isLoading ? "true" : "false"}
      >
        <Chart side={side} data={chartData ?? []} />
      </div>
    </div>
  );
}
