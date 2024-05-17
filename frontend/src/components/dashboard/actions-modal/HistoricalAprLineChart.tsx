import { useEffect, useMemo, useRef, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";
import { format } from "date-fns";
import { capitalize } from "lodash";
import * as Recharts from "recharts";
import { useLocalStorage } from "usehooks-ts";

import { Side } from "@suilend/sdk/types";

import Button from "@/components/shared/Button";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import useIsTouchscreen from "@/hooks/useIsTouchscreen";
import {
  ReserveAssetDataEvent,
  calculateBorrowAprPercent,
  calculateDepositAprPercent,
} from "@/lib/events";
import { formatPercent } from "@/lib/format";
import { API_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const DAY_S = 24 * 60 * 60;

type DownsampledReserveAssetDataEvent = ReserveAssetDataEvent & {
  sampletimestamp: number;
};

type ChartData = {
  index: number;
  timestampS: number;
  depositAprPercent?: number;
  borrowAprPercent?: number;
};

interface TooltipContentProps {
  side: Side;
  data?: ChartData;
}

function TooltipContent({ side, data }: TooltipContentProps) {
  if (!data) return null;

  const aprPercent =
    side === Side.DEPOSIT ? data.depositAprPercent : data.borrowAprPercent;

  return (
    // TooltipContent className
    <div className="flex flex-col items-end rounded-md border bg-popover px-3 py-1.5 shadow-md animate-in fade-in-0 zoom-in-95">
      <TLabelSans>
        {format(new Date(data.timestampS * 1000), "MM/dd HH:mm")}
      </TLabelSans>

      {aprPercent !== undefined && (
        <div className="flex flex-row items-baseline gap-2">
          <TLabelSans>{capitalize(side)} APR</TLabelSans>
          <TBody>{formatPercent(new BigNumber(aprPercent))}</TBody>
        </div>
      )}
    </div>
  );
}

interface ChartProps {
  side: Side;
  isLoading: boolean;
  data: ChartData[];
}

function Chart({ side, isLoading, data }: ChartProps) {
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
        side === Side.DEPOSIT ? d.depositAprPercent : d.borrowAprPercent,
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
        if (days === 90) return d.timestampS % ((sm ? 15 : 30) * DAY_S) === 0;
        return false;
      })
      .map((d) => d.timestampS);
  }, [data, days, sm]);
  const ticksY = Array.from({ length: sm ? 4 : 3 }).map(
    (_, index, array) => Math.ceil(maxY / (array.length - 1)) * index,
  );

  const tickXFormatter = (timestampS: number) => {
    if (days === 1) return format(new Date(timestampS * 1000), "HH:mm");
    return format(new Date(timestampS * 1000), "MM/dd");
  };
  const tickYFormatter = (value: number) => value.toString();

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
      className="relative z-[1]"
      data-loading={data.length > 0}
    >
      <Recharts.LineChart
        data={data}
        margin={{ top: 8, right: 16, bottom: -12, left: -15 }}
      >
        <Recharts.CartesianGrid
          strokeDasharray="1 4"
          stroke="hsla(var(--secondary) / 25%)"
          fill="transparent"
        >
          <div className="inset absolute bg-[red]" />
        </Recharts.CartesianGrid>
        <Recharts.XAxis
          type="number"
          dataKey="timestampS"
          ticks={ticksX}
          tickMargin={tickMargin}
          tick={tick}
          axisLine={{
            stroke: "#1A4176", // 25% var(--secondary) on var(--popover)
          }}
          tickLine={tickLine}
          tickFormatter={tickXFormatter}
          domain={domainX}
        />
        <Recharts.YAxis
          type="number"
          ticks={ticksY}
          tickMargin={tickMargin}
          tick={tick}
          axisLine={{
            stroke: "#1A4176", // 25% var(--secondary) on var(--popover)
          }}
          tickLine={tickLine}
          tickFormatter={tickYFormatter}
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
            offset={20}
          />
        </Recharts.YAxis>
        <Recharts.Line
          dataKey={
            side === Side.DEPOSIT ? "depositAprPercent" : "borrowAprPercent"
          }
          isAnimationActive={false}
          stroke="hsl(var(--success))"
          dot={{
            stroke: "transparent",
            strokeWidth: 0,
            fill: "transparent",
          }}
          strokeWidth={2}
        />
        {!isLoading && (
          <Recharts.Tooltip
            isAnimationActive={false}
            filterNull={false}
            cursor={{ stroke: "hsl(var(--foreground))", strokeWidth: 1 }}
            trigger={isTouchscreen ? "hover" : "hover"}
            content={({ active, payload }) => (
              <TooltipContent
                side={side}
                data={!!active ? payload?.[0]?.payload : undefined}
              />
            )}
          />
        )}
      </Recharts.LineChart>
    </Recharts.ResponsiveContainer>
  );
}

interface HistoricalAprLineChartProps {
  reserveId: string;
  side: Side;
}

export default function HistoricalAprLineChart({
  reserveId,
  side,
}: HistoricalAprLineChartProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  const reserveMapRef = useRef<AppData["reserveMap"]>(data.reserveMap);

  // Data
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const [days, setDays] = useLocalStorage<number>(
    "historicalAprLineChartDays",
    7,
  );

  const onDaysClick = (value: number) => {
    if (!isLoading) setDays(value);
  };

  const isFetchingEventsRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingEventsRef.current) return;

      isFetchingEventsRef.current = true;
      setIsLoading(true);

      try {
        // Events
        const sampleIntervalS = (() => {
          if (days === 1) return 15 * 60;
          if (days === 7) return 2 * 60 * 60;
          if (days === 30) return 8 * 60 * 60;
          if (days === 90) return 24 * 60 * 60;
          return 24 * 60 * 60;
        })();

        const url = `${API_URL}/events/downsampled-reserve-asset-data?reserveId=${reserveId}&days=${days}&sampleIntervalS=${sampleIntervalS}`;
        const res = await fetch(url);
        const json = (await res.json()) as DownsampledReserveAssetDataEvent[];

        for (const event of json) {
          event.coinType = normalizeStructTag(event.coinType);
        }

        // Data
        const daysS = days * DAY_S;
        const n = daysS / sampleIntervalS;

        const lastTimestampS =
          Date.now() / 1000 - ((Date.now() / 1000) % sampleIntervalS);
        const timestampsS = Array.from({ length: n })
          .map((_, index) => lastTimestampS - index * sampleIntervalS)
          .reverse();

        const result: ChartData[] = [];
        timestampsS.forEach((timestampS, index) => {
          let depositAprPercent: number | undefined = undefined;
          let borrowAprPercent: number | undefined = undefined;

          const event = json.find(
            (event) => event.sampletimestamp === timestampS,
          );
          if (event) {
            const reserve = reserveMapRef.current[event.coinType];
            depositAprPercent = +calculateDepositAprPercent(reserve, event);
            borrowAprPercent = +calculateBorrowAprPercent(reserve, event);
          } else {
            const prevDatum = result.findLast(
              (d) =>
                d.depositAprPercent !== undefined &&
                d.borrowAprPercent !== undefined,
            );
            depositAprPercent = prevDatum?.depositAprPercent;
            borrowAprPercent = prevDatum?.borrowAprPercent;
          }

          result.push({
            index,
            timestampS,
            depositAprPercent,
            borrowAprPercent,
          });
        });

        setChartData(result);
      } catch (err) {
        console.error(err);
      } finally {
        isFetchingEventsRef.current = false;
        setIsLoading(false);
      }
    })();
  }, [reserveId, days]);

  // Chart
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex w-full flex-col items-end">
      <div className="relative z-[2] -mb-1 -mt-2 mr-4 flex flex-row md:-mt-1">
        {[1, 7, 30, 90].map((_days) => (
          <Button
            key={_days}
            className="px-2 text-muted-foreground hover:bg-transparent"
            labelClassName={cn(
              "text-xs uppercase",
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
        ref={containerRef}
        id="historical-apr-line-chart"
        className="relative z-[1] h-[95px] w-full flex-shrink-0 transform-gpu sm:h-[160px]"
        is-loading={isLoading ? "true" : "false"}
      >
        <Chart side={side} isLoading={isLoading} data={chartData} />
      </div>
    </div>
  );
}
