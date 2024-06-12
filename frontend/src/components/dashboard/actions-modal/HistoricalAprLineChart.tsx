import { useEffect, useMemo, useRef } from "react";

import BigNumber from "bignumber.js";
import { format } from "date-fns";
import { capitalize } from "lodash";
import * as Recharts from "recharts";
import { useLocalStorage } from "usehooks-ts";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import AprRewardsBreakdownRow from "@/components/dashboard/AprRewardsBreakdownRow";
import Button from "@/components/shared/Button";
import CartesianGridVerticalLine from "@/components/shared/CartesianGridVerticalLine";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TBodySans, TLabelSans } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import useIsTouchscreen from "@/hooks/useIsTouchscreen";
import {
  ViewBox,
  axis,
  axisLabel,
  getTooltipStyle,
  line,
  tooltip,
} from "@/lib/chart";
import { COINTYPE_COLOR_MAP, NORMALIZED_SUI_COINTYPE } from "@/lib/coinType";
import {
  DAYS,
  DAY_S,
  Days,
  RESERVE_EVENT_SAMPLE_INTERVAL_S_MAP,
  calculateRewardsDepositAprPercent,
} from "@/lib/events";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const getFieldCoinType = (field: string) =>
  field.includes("_") ? field.split("_")[1] : undefined;
const getFieldColor = (field: string) => {
  const coinType = getFieldCoinType(field);
  return coinType ? COINTYPE_COLOR_MAP[coinType] : "hsl(var(--success))";
};

type ChartData = {
  timestampS: number;
  [interestAprPercent: string]: number;
};

interface TooltipContentProps {
  side: Side;
  fields: string[];
  d: ChartData;
  viewBox?: ViewBox;
  x?: number;
}

function TooltipContent({ side, fields, d, viewBox, x }: TooltipContentProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  if (viewBox === undefined || x === undefined) return null;
  return (
    // Subset of TooltipContent className
    <div
      className="absolute rounded-md border bg-popover px-3 py-1.5 shadow-md"
      style={getTooltipStyle(fields.length > 1 ? 240 : 200, viewBox, x)}
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
                fields.reduce((acc: number, field) => acc + d[field], 0),
              ),
            )}
          </TBody>
        </div>

        {fields.map((field, index) => {
          const coinType = getFieldCoinType(field);
          const color = getFieldColor(field);

          return (
            <AprRewardsBreakdownRow
              key={field}
              isLast={index === fields.length - 1}
              value={
                <span style={{ color }}>
                  {formatPercent(new BigNumber(d[field]))}
                </span>
              }
            >
              {!coinType ? (
                <TLabelSans>Interest</TLabelSans>
              ) : (
                <>
                  <TLabelSans>Rewards in</TLabelSans>
                  <TokenLogo
                    className="h-4 w-4"
                    coinType={coinType}
                    symbol={data.coinMetadataMap[coinType].symbol}
                    src={data.coinMetadataMap[coinType].iconUrl}
                  />
                  <TLabelSans>
                    {data.coinMetadataMap[coinType].symbol}
                  </TLabelSans>
                </>
              )}
            </AprRewardsBreakdownRow>
          );
        })}
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
    data.length > 1 ? data[1].timestampS - data[0].timestampS : 1;
  const samplesPerDay = DAY_S / sampleIntervalS;
  const days = data.length / samplesPerDay;

  // Data
  const allFields =
    data.length > 0
      ? Object.keys(data[0]).filter((key) => key !== "timestampS")
      : [];

  const fieldsMap = {
    [Side.DEPOSIT]: allFields.filter((field) =>
      field.startsWith("depositInterestAprPercent"),
    ),
    [Side.BORROW]: allFields.filter((field) =>
      field.startsWith("borrowInterestAprPercent"),
    ),
  };
  const fields = fieldsMap[side];

  // Min/max
  const minX = Math.min(...data.map((d) => d.timestampS));
  const maxX = Math.max(...data.map((d) => d.timestampS));

  const minY = 0;
  const maxY = Math.max(
    ...data.map((d) =>
      fields.reduce((acc: number, field) => acc + d[field], 0),
    ),
  );

  // Ticks
  const ticksX = data
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
  const ticksY = Array.from({ length: 4 }).map(
    (_, index, array) => Math.ceil(maxY / (array.length - 1)) * index,
  );

  const tickFormatterX = (timestampS: number) => {
    if (days === 1) return format(new Date(timestampS * 1000), "HH:mm");
    return format(new Date(timestampS * 1000), "MM/dd");
  };
  const tickFormatterY = (value: number) =>
    formatPercent(new BigNumber(value), { dp: 0 });

  // Domain
  const domainX = [minX, maxX];
  const domainY = [minY, maxY];

  return (
    <Recharts.ResponsiveContainer width="100%" height="100%">
      <Recharts.AreaChart
        data={data}
        margin={{ top: 8, right: 16, bottom: -12, left: -5 }}
      >
        <Recharts.CartesianGrid
          strokeDasharray="1 4"
          stroke="hsla(var(--secondary) / 20%)"
          fill="transparent"
          horizontal={false}
          vertical={(props) => <CartesianGridVerticalLine {...props} />}
        />
        <Recharts.XAxis
          type="number"
          dataKey="timestampS"
          ticks={ticksX}
          tickMargin={axis.tickMargin}
          tick={axis.tick}
          axisLine={axis.axisLine}
          tickLine={axis.tickLine}
          tickFormatter={tickFormatterX}
          domain={domainX}
        />
        <Recharts.YAxis
          type="number"
          ticks={ticksY}
          tickMargin={axis.tickMargin}
          tick={axis.tick}
          axisLine={axis.axisLine}
          tickLine={axis.tickLine}
          tickFormatter={tickFormatterY}
          domain={domainY}
        >
          <Recharts.Label
            value={`${capitalize(side)} APR`}
            offset={5 + 5}
            position="insideLeft"
            angle={-90}
            style={axisLabel.style}
          />
        </Recharts.YAxis>
        {fields.map((field) => {
          const color = getFieldColor(field);

          return (
            <Recharts.Area
              key={field}
              type="monotone"
              stackId="1"
              dataKey={field}
              isAnimationActive={false}
              stroke={color}
              fill={color}
              fillOpacity={0.1}
              dot={line.dot}
              strokeWidth={line.strokeWidth}
            />
          );
        })}
        {data.length > 0 && (
          <Recharts.Tooltip
            isAnimationActive={false}
            filterNull={false}
            cursor={tooltip.cursor}
            trigger={isTouchscreen ? "hover" : "hover"}
            wrapperStyle={tooltip.wrapperStyle}
            content={({ active, payload, viewBox, coordinate }) => {
              if (!active || !payload?.[0]?.payload) return null;
              return (
                <TooltipContent
                  side={side}
                  fields={fields}
                  d={payload[0].payload as ChartData}
                  viewBox={viewBox as any}
                  x={coordinate?.x}
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

    const result: (Pick<ChartData, "timestampS"> & Partial<ChartData>)[] = [];
    timestampsS.forEach((timestampS) => {
      const event = events.findLast((e) => e.sampleTimestampS <= timestampS);
      result.push({
        timestampS,
        depositInterestAprPercent: event ? +event.depositAprPercent : undefined,
        borrowInterestAprPercent: event ? +event.borrowAprPercent : undefined,
        [`depositInterestAprPercent_${NORMALIZED_SUI_COINTYPE}`]: event
          ? calculateRewardsDepositAprPercent(event, suiEvents, reserve)
          : undefined,
      });
    });

    const fields =
      result.length > 0
        ? Object.keys(result[0]).filter((key) => key !== "timestampS")
        : [];

    for (const d of result) {
      let hasUndefined = false;
      for (const field of fields) {
        if (d[field] === undefined) {
          d[field] = result.find((_d) => _d[field] !== undefined)?.[field];
          hasUndefined = true;
        }
      }
      if (!hasUndefined) break;
    }

    return result as ChartData[];
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
