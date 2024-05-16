import { useEffect, useMemo, useRef, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import { format } from "date-fns";
import * as Recharts from "recharts";

import styles from "@/components/dashboard/actions-modal/HistoricalAprLineChart.module.scss";
import { Skeleton } from "@/components/ui/skeleton";
import { AppData, useAppContext } from "@/contexts/AppContext";
import {
  ReserveAssetDataEvent,
  calculateBorrowAprPercent,
  calculateDepositAprPercent,
} from "@/lib/events";
import { API_URL } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type ChartData = {
  index: number;
  timestampS: number;
  depositAprPercent: number;
  borrowAprPercent: number;
};

interface ChartProps {
  data: ChartData[];
}

function Chart({ data }: ChartProps) {
  const domainX = [
    Math.min(...data.map((d) => d.index)),
    Math.max(...data.map((d) => d.index)),
  ];

  const maxY = Math.max(
    ...data.map((d) => [d.depositAprPercent, d.borrowAprPercent]).flat(),
  );
  const ticksY = Array.from({ length: 4 }).map(
    (_, index, array) =>
      Math.ceil(maxY / (array.length - 1)) *
      (array.length - 1) *
      (index / (array.length - 1)),
  );
  const domainY = [0, maxY];

  return (
    <Recharts.ResponsiveContainer
      width="100%"
      height="100%"
      className="relative z-[1]"
    >
      <Recharts.LineChart
        data={data}
        margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
      >
        <Recharts.CartesianGrid
          strokeDasharray="1 4"
          stroke="hsla(var(--secondary) / 25%)"
        />
        <Recharts.XAxis
          dataKey="index"
          tickCount={7}
          domain={domainX}
          type="number"
          tick={{
            fontSize: 11,
            fontFamily: "var(--font-geist-sans)",
            fill: "hsl(var(--muted-foreground))",
          }}
          tickLine={{
            stroke: "transparent",
          }}
          tickFormatter={(value: number) =>
            format(new Date(data[value].timestampS * 1000), "MM/dd")
          }
          tickMargin={2}
          axisLine={{
            stroke:
              "color-mix(in hsl, hsl(var(--secondary)) 25%, hsl(var(--popover)))",
          }}
        />
        <Recharts.YAxis
          ticks={ticksY}
          tickMargin={2}
          domain={domainY}
          type="number"
          tick={{
            fontSize: 11,
            fontFamily: "var(--font-geist-sans)",
            fill: "hsl(var(--muted-foreground))",
          }}
          tickLine={{
            stroke: "transparent",
          }}
          tickFormatter={(value: number) => Math.round(value).toString()}
          axisLine={{
            stroke:
              "color-mix(in hsl, hsl(var(--secondary)) 25%, hsl(var(--popover)))",
          }}
          unit="%"
        >
          <Recharts.Label
            value="APR"
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
          />
        </Recharts.YAxis>
        <Recharts.Line
          dataKey="depositAprPercent"
          isAnimationActive={false}
          stroke="hsl(var(--foreground))"
          dot={{
            stroke: "transparent",
            strokeWidth: 0,
            fill: "transparent",
          }}
          strokeWidth={2}
        />
        <Recharts.Line
          dataKey="borrowAprPercent"
          isAnimationActive={false}
          stroke="hsl(var(--foreground))"
          dot={{
            stroke: "transparent",
            strokeWidth: 0,
            fill: "transparent",
          }}
          strokeWidth={2}
        />
      </Recharts.LineChart>
    </Recharts.ResponsiveContainer>
  );
}

interface HistoricalAprLineChartProps {
  reserveId: string;
}

export default function HistoricalAprLineChart({
  reserveId,
}: HistoricalAprLineChartProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  // Events
  const [events, setEvents] = useState<ReserveAssetDataEvent[] | undefined>(
    undefined,
  );

  const isFetchingEventsRef = useRef<boolean>(false);
  useEffect(() => {
    (async () => {
      if (isFetchingEventsRef.current) return;

      isFetchingEventsRef.current = true;
      try {
        const url = `${API_URL}/events/downsampled-reserve-asset-data?reserveId=${reserveId}&days=30&sampleIntervalS=${4 * 60 * 60}`;
        const res = await fetch(url);
        const json = (await res.json()) as ReserveAssetDataEvent[];

        for (const event of json) {
          event.coinType = normalizeStructTag(event.coinType);
        }

        setEvents(json);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [reserveId]);

  // Data
  const chartData = useMemo(() => {
    if (events === undefined) return;

    return events.map((event, index) => {
      const reserve = data.reserveMap[event.coinType];

      const timestampS = event.timestamp;
      const depositAprPercent = calculateDepositAprPercent(reserve, event);
      const borrowAprPercent = calculateBorrowAprPercent(reserve, event);

      return {
        index,
        timestampS: +timestampS,
        depositAprPercent: depositAprPercent.toNumber(),
        borrowAprPercent: borrowAprPercent.toNumber(),
      } as ChartData;
    });
  }, [events, data.reserveMap]);

  // Chart
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(styles.container, "relative h-full w-full transform-gpu")}
    >
      {chartData === undefined ? (
        <Skeleton className="flex h-full w-full flex-row items-center justify-center" />
      ) : (
        <Chart data={chartData} />
      )}
    </div>
  );
}
