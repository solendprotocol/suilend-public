import BigNumber from "bignumber.js";
import { format } from "date-fns";
import * as Recharts from "recharts";
import { Coordinate } from "recharts/types/util/types";

import { Side } from "@suilend/sdk/types";

import TokenLogo from "@/components/shared/TokenLogo";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import useBreakpoint from "@/hooks/useBreakpoint";
import useIsTouchscreen from "@/hooks/useIsTouchscreen";
import {
  COIN_TYPE_COLOR_MAP,
  NORMALIZED_SUI_COINTYPE,
  NORMALIZED_USDC_ET_COINTYPE,
  NORMALIZED_USDT_ET_COINTYPE,
} from "@/lib/coinType";
import { formatToken } from "@/lib/format";

type ChartData = {
  timestampS: number;
  amountSui?: number;
  amountUsdc?: number;
  amountUsdt?: number;
};

interface TooltipContentProps {
  chartData?: ChartData;
  viewBox: {
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  coordinate?: Partial<Coordinate>;
}

function TooltipContent({
  chartData,
  viewBox,
  coordinate,
}: TooltipContentProps) {
  const appContext = useAppContext();
  const data = appContext.data as AppData;

  const getStyle = () => {
    if (coordinate?.x === undefined) return undefined;

    const width = 160;
    const top = viewBox.top;
    let left: string | number = "auto";
    let right: string | number = "auto";
    const offset = 10;

    const isOverHalfway = coordinate.x - viewBox.left > viewBox.width / 2;
    if (isOverHalfway) {
      right = Math.min(
        viewBox.left + viewBox.width + viewBox.right - width,
        viewBox.left + viewBox.width + viewBox.right - (coordinate.x - offset),
      );
    } else {
      left = Math.min(
        viewBox.left + viewBox.width + viewBox.right - width,
        coordinate.x + offset,
      );
    }

    return { width, top, left, right };
  };

  if (!chartData) return null;
  if (!coordinate?.x || !viewBox) return null;

  const assets: {
    coinType: string;
    symbol: string;
    src?: string | null;
    amount: number;
    color: string;
  }[] = [];
  const amountKeyCoinTypeMap = {
    amountSui: NORMALIZED_SUI_COINTYPE,
    amountUsdc: NORMALIZED_USDC_ET_COINTYPE,
    amountUsdt: NORMALIZED_USDT_ET_COINTYPE,
  };
  Object.entries(amountKeyCoinTypeMap).forEach(([amountKey, coinType]) => {
    if (chartData[amountKey as keyof ChartData] === undefined) return;

    const coinMetadata = data.coinMetadataMap[coinType];
    assets.push({
      coinType,
      symbol: coinMetadata.symbol,
      src: coinMetadata.iconUrl,
      amount: chartData[amountKey as keyof ChartData] as number,
      color: COIN_TYPE_COLOR_MAP[coinType],
    });
  });

  return (
    // Subset of TooltipContent className
    <div
      className="absolute rounded-md border bg-popover px-3 py-1.5 shadow-md"
      style={getStyle()}
    >
      <div className="flex w-full flex-col gap-1">
        <TLabelSans className="mb-1">
          {format(new Date(chartData.timestampS * 1000), "MM/dd HH:mm")}
        </TLabelSans>

        {assets.map((asset) => (
          <div
            key={asset.coinType}
            className="flex w-full flex-row items-center justify-between gap-4"
          >
            <div className="flex flex-row items-center gap-1.5">
              <TokenLogo
                className="h-4 w-4"
                coinType={asset.coinType}
                symbol={asset.symbol}
                src={asset.src}
              />
              <TLabelSans>{asset.symbol}</TLabelSans>
            </div>

            <TBody style={{ color: asset.color }}>
              {formatToken(new BigNumber(asset.amount), { exact: false })}
            </TBody>
          </div>
        ))}
      </div>
    </div>
  );
}

interface EarningsTabAmountChartProps {
  side: Side;
  isLoading: boolean;
  data: ChartData[];
}

export default function EarningsTabAmountChart({
  side,
  isLoading,
  data,
}: EarningsTabAmountChartProps) {
  const { md } = useBreakpoint();
  const isTouchscreen = useIsTouchscreen();

  const hasSui = data.some((d) => d.amountSui !== 0);
  const hasUsdc = data.some((d) => d.amountUsdc !== 0);
  const hasUsdt = data.some((d) => d.amountUsdt !== 0);
  if (!hasSui && !hasUsdc && !hasUsdt) return null;

  const dayS = 86400;

  // Min/max
  const minX = Math.min(...data.map((d) => d.timestampS));
  const maxX = Math.max(...data.map((d) => d.timestampS));
  const days = (maxX - minX) / dayS;

  const minY = 0;
  const maxY = Math.max(
    ...data
      .map(
        (d) =>
          [d.amountSui, d.amountUsdc, d.amountUsdt].filter(Boolean) as number[],
      )
      .flat(),
  );

  // Ticks
  const ticksX = Array.from(
    new Set(
      Array.from({ length: md ? 7 : 5 }).map((_, index, array) => {
        let timestampS = minX + ((maxX - minX) / (array.length - 1)) * index;
        timestampS =
          timestampS -
          (timestampS % dayS) +
          new Date().getTimezoneOffset() * 60;

        return timestampS;
      }),
    ),
  );
  const ticksY = Array.from({ length: md ? 4 : 3 }).map(
    (_, index, array) => minY + ((maxY - minY) / (array.length - 1)) * index,
  );

  const tickXFormatter = (timestampS: number) => {
    return format(new Date(timestampS * 1000), days >= 7 ? "MM/dd" : "MM/dd");
  };
  const tickYFormatter = (value: number) =>
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
  const labelY = side === Side.DEPOSIT ? "Deposited" : "Borrowed";

  return (
    <div className="mb-2 h-[160px] w-full flex-shrink-0 transform-gpu md:h-[200px]">
      <Recharts.ResponsiveContainer
        className="relative z-[1]"
        width="100%"
        height="100%"
      >
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
            tickFormatter={tickXFormatter}
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
            tickFormatter={tickYFormatter}
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
          {hasUsdt && (
            <Recharts.Line
              dataKey="amountUsdt"
              isAnimationActive={false}
              stroke={COIN_TYPE_COLOR_MAP[NORMALIZED_USDT_ET_COINTYPE]}
              dot={{
                stroke: "transparent",
                strokeWidth: 0,
                fill: "transparent",
              }}
              strokeWidth={1.5}
            />
          )}
          {hasUsdc && (
            <Recharts.Line
              dataKey="amountUsdc"
              isAnimationActive={false}
              stroke={COIN_TYPE_COLOR_MAP[NORMALIZED_USDC_ET_COINTYPE]}
              dot={{
                stroke: "transparent",
                strokeWidth: 0,
                fill: "transparent",
              }}
              strokeWidth={1.5}
            />
          )}
          {hasSui && (
            <Recharts.Line
              dataKey="amountSui"
              isAnimationActive={false}
              stroke={COIN_TYPE_COLOR_MAP[NORMALIZED_SUI_COINTYPE]}
              dot={{
                stroke: "transparent",
                strokeWidth: 0,
                fill: "transparent",
              }}
              strokeWidth={1.5}
            />
          )}
          {!isLoading && (
            <Recharts.Tooltip
              isAnimationActive={false}
              filterNull={false}
              cursor={{ stroke: "hsl(var(--foreground))", strokeWidth: 1 }}
              trigger={isTouchscreen ? "hover" : "hover"}
              wrapperStyle={{
                transform: undefined,
                position: undefined,
                top: undefined,
                left: undefined,
              }}
              content={({ active, payload, viewBox, coordinate }) => {
                const parsedPayload = payload?.[0]?.payload;
                if (parsedPayload) {
                  if (!hasSui) parsedPayload.amountSui = undefined;
                  if (!hasUsdc) parsedPayload.amountUsdc = undefined;
                  if (!hasUsdt) parsedPayload.amountUsdt = undefined;
                }

                return (
                  <TooltipContent
                    chartData={!!active ? parsedPayload : undefined}
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
