import BigNumber from "bignumber.js";
import { format } from "date-fns";
import * as Recharts from "recharts";
import { Coordinate } from "recharts/types/util/types";

import { Side } from "@suilend/sdk/types";

import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { ViewBox, getTooltipStyle } from "@/components/ui/chart";
import { AppData, useAppContext } from "@/contexts/AppContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import useIsTouchscreen from "@/hooks/useIsTouchscreen";
import { COIN_TYPE_COLOR_MAP } from "@/lib/coinType";
import { DAY_S } from "@/lib/events";
import { formatToken } from "@/lib/format";

export type ChartData = {
  timestampS: number;
  [coinType: string]: number;
};

interface TooltipContentProps {
  coinTypes: string[];
  d: ChartData;
  viewBox: ViewBox;
  coordinate?: Partial<Coordinate>;
}

function TooltipContent({
  coinTypes,
  d,
  viewBox,
  coordinate,
}: TooltipContentProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  if (!coordinate?.x || !viewBox) return null;
  return (
    // Subset of TooltipContent className
    <div
      className="absolute rounded-md border bg-popover px-3 py-1.5 shadow-md"
      style={getTooltipStyle(160, viewBox, coordinate)}
    >
      <div className="flex w-full flex-col gap-1">
        <TLabelSans className="mb-1">
          {format(new Date(d.timestampS * 1000), "MM/dd HH:mm")}
        </TLabelSans>

        {coinTypes.map((coinType) => {
          const coinMetadata = data.coinMetadataMap[coinType];

          return (
            <div
              key={coinType}
              className="flex w-full flex-row items-center justify-between gap-4"
            >
              <div className="flex flex-row items-center gap-1.5">
                <TokenLogo
                  className="h-4 w-4"
                  coinType={coinType}
                  symbol={coinMetadata.symbol}
                  src={coinMetadata.iconUrl}
                />
                <TLabelSans>{coinMetadata.symbol}</TLabelSans>
              </div>

              <TBody style={{ color: COIN_TYPE_COLOR_MAP[coinType] }}>
                {formatToken(new BigNumber(d[coinType] as number), {
                  exact: false,
                })}
              </TBody>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface EarningsChartProps {
  side: Side;
  isLoading: boolean;
  data: ChartData[];
}

export default function EarningsChart({
  side,
  isLoading,
  data,
}: EarningsChartProps) {
  const { md } = useBreakpoint();
  const isTouchscreen = useIsTouchscreen();

  const dayS = 86400;

  // Data
  const coinTypes =
    data.length > 0
      ? Object.keys(data[0]).filter((key) => key !== "timestampS")
      : [];

  const timestampsS = data.map((d) => d.timestampS).flat();
  const cumInterest = data
    .map((d) => coinTypes.map((coinType) => d[coinType]).flat())
    .flat();

  // Min/max
  const minX = Math.min(...timestampsS);
  const maxX = Math.max(...timestampsS);

  const minY = 0;
  const maxY = Math.max(...cumInterest);

  // Ticks
  const ticksX =
    (maxX - minX) / DAY_S < 1
      ? [minX - (minX % 60)]
      : Array.from(
          new Set(
            Array.from({ length: md ? 7 : 5 }).map((_, index, array) => {
              const timestampS =
                minX + ((maxX - minX) / (array.length - 1)) * index;
              return (
                timestampS -
                (timestampS % dayS) +
                new Date().getTimezoneOffset() * 60
              );
            }),
          ),
        );
  const ticksY = Array.from({ length: 4 }).map(
    (_, index, array) => minY + ((maxY - minY) / (array.length - 1)) * index,
  );

  const tickFormatterX = (timestampS: number) =>
    format(new Date(timestampS * 1000), "MM/dd");
  const tickFormatterY = (value: number) =>
    formatToken(new BigNumber(value), { exact: false });

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
  const domainX = [minX, maxX];
  const domainY = [minY, maxY];

  // Labels
  const labelY = side === Side.DEPOSIT ? "Interest earned" : "Interest paid";

  return (
    <div
      className="earnings-chart h-[160px] w-full flex-shrink-0 transform-gpu md:h-[200px]"
      is-loading={isLoading ? "true" : "false"}
    >
      <Recharts.ResponsiveContainer width="100%" height="100%">
        <Recharts.LineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: -12, left: 10 + 16 }}
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
          >
            <Recharts.Label
              value={labelY}
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
              offset={5 - 10}
            />
          </Recharts.YAxis>
          {/* <Recharts.Legend
            formatter={(coinType) => data.coinMetadataMap[coinType].symbol}
          /> */}
          {coinTypes
            .slice()
            .reverse()
            .map((coinType) => (
              <Recharts.Line
                key={coinType}
                type="monotone"
                dataKey={coinType}
                isAnimationActive={false}
                stroke={COIN_TYPE_COLOR_MAP[coinType]}
                dot={{
                  stroke: "transparent",
                  strokeWidth: 0,
                  fill: "transparent",
                }}
                strokeWidth={2}
              />
            ))}
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
                    coinTypes={coinTypes}
                    d={payload[0].payload as ChartData}
                    viewBox={viewBox as any}
                    coordinate={coordinate}
                  />
                );
              }}
            />
          )}
        </Recharts.LineChart>
      </Recharts.ResponsiveContainer>
    </div>
  );
}
