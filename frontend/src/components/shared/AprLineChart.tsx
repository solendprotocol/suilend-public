import { useRef, useState } from "react";

import BigNumber from "bignumber.js";
import * as Recharts from "recharts";

import { linearlyInterpolate } from "@suilend/sdk/utils";

import AprRewardsBreakdownRow from "@/components/dashboard/AprRewardsBreakdownRow";
import CartesianGridVerticalLine from "@/components/shared/CartesianGridVerticalLine";
import Tooltip from "@/components/shared/Tooltip";
import { TBodySans, TLabelSans } from "@/components/shared/Typography";
import useIsTouchscreen from "@/hooks/useIsTouchscreen";
import {
  ViewBox,
  axis,
  axisLabel,
  getTooltipStyle,
  line,
  tooltip,
} from "@/lib/chart";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const transform = (value: number) => Math.pow(value, 1 / 2);
const inverseTransform = (value: number) => Math.pow(value, 2);

type ChartData = {
  utilPercent: number;
  aprPercent: number;
};

type TransformedChartData = ChartData & {
  transformedAprPercent: number;
};

interface TooltipContentProps {
  d: ChartData;
  dp?: number;
}

function TooltipContent({ d, dp }: TooltipContentProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <TBodySans>
        Borrow APR
        <span className="text-xs text-muted-foreground">
          {" at "}
          {formatPercent(new BigNumber(d.utilPercent), { dp: dp ?? 0 })} util.
        </span>
      </TBodySans>

      <AprRewardsBreakdownRow
        isLast
        value={
          <span className="text-success">
            {formatPercent(new BigNumber(d.aprPercent))}
          </span>
        }
      >
        <TLabelSans>Interest</TLabelSans>
      </AprRewardsBreakdownRow>
    </div>
  );
}

interface CustomTooltipProps {
  d: ChartData;
  viewBox?: ViewBox;
  x?: number;
}

function CustomTooltip({ d, viewBox, x }: CustomTooltipProps) {
  if (viewBox === undefined || x === undefined) return null;
  return (
    // Subset of TooltipContent className
    <div
      className="absolute z-[2] rounded-md border bg-popover px-3 py-1.5 shadow-md"
      style={getTooltipStyle(200, viewBox, x)}
    >
      <TooltipContent d={d} />
    </div>
  );
}

interface AprLineChartProps {
  data: ChartData[];
  reference?: ChartData;
}

export default function AprLineChart({ data, reference }: AprLineChartProps) {
  const isTouchscreen = useIsTouchscreen();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  // Data
  const interpolatedData: TransformedChartData[] = Array.from({
    length: 101,
  }).map((_, utilPercent) => ({
    utilPercent,
    aprPercent: +linearlyInterpolate(
      data,
      "utilPercent",
      "aprPercent",
      utilPercent,
    ),
    transformedAprPercent: +linearlyInterpolate(
      data.map((d) => ({
        ...d,
        aprPercent: transform(d.aprPercent),
      })),
      "utilPercent",
      "aprPercent",
      utilPercent,
    ),
  }));

  // Min/max
  const minX = Math.min(...interpolatedData.map((d) => d.utilPercent));
  const maxX = Math.max(...interpolatedData.map((d) => d.utilPercent));

  const minY = 0;
  const maxY = Math.max(
    ...interpolatedData.map((d) => d.transformedAprPercent),
  );

  // Ticks
  const ticksX = Array.from({ length: 5 }).map(
    (_, index, array) => minX + (maxX - minX) * (index / (array.length - 1)),
  );

  const tickFormatterX = (utilPercent: number) =>
    formatPercent(new BigNumber(utilPercent), { dp: 0 });
  const tickFormatterY = (transformedAprPercent: number) =>
    formatPercent(new BigNumber(inverseTransform(transformedAprPercent)), {
      dp: 0,
    });

  // Domain
  const domainX = [minX, maxX];
  const domainY = [minY, maxY];

  return (
    <div
      ref={containerRef}
      className="apr-line-chart relative h-full w-full transform-gpu"
      is-loading="false"
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <Recharts.ResponsiveContainer
        className="relative"
        width="100%"
        height="100%"
      >
        <Recharts.LineChart
          data={interpolatedData}
          margin={{ top: 8, right: 16, bottom: 5, left: -5 }}
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
            dataKey="utilPercent"
            ticks={ticksX}
            tickMargin={axis.tickMargin}
            tick={axis.tick}
            axisLine={axis.axisLine}
            tickLine={axis.tickLine}
            tickFormatter={tickFormatterX}
            domain={domainX}
          >
            <Recharts.Label
              value="Utilization"
              offset={-4}
              position="insideBottom"
              style={axisLabel.style}
            />
          </Recharts.XAxis>
          <Recharts.YAxis
            type="number"
            tickMargin={axis.tickMargin}
            tick={axis.tick}
            axisLine={axis.axisLine}
            tickLine={axis.tickLine}
            tickFormatter={tickFormatterY}
            domain={domainY}
          >
            <Recharts.Label
              value="Borrow APR"
              offset={5 + 5}
              position="insideLeft"
              angle={-90}
              style={axisLabel.style}
            />
          </Recharts.YAxis>
          <Recharts.Line
            dataKey="transformedAprPercent"
            isAnimationActive={false}
            stroke="hsl(var(--success))"
            dot={line.dot}
            strokeWidth={line.strokeWidth}
          />
          {reference && (
            <Recharts.ReferenceDot
              x={reference.utilPercent}
              y={
                +linearlyInterpolate(
                  interpolatedData,
                  "utilPercent",
                  "transformedAprPercent",
                  reference.utilPercent,
                )
              }
              fill="hsl(var(--foreground))"
              strokeWidth={0}
              r={4}
              shape={(props: any) => (
                <Tooltip
                  rootProps={{ open: true }}
                  portalProps={{ container: containerRef.current }}
                  contentProps={{
                    className: cn(
                      "w-[200px] min-w-[200px] transition-opacity !pointer-events-none",
                      isMouseOver && "opacity-0",
                    ),
                    sideOffset: 8,
                    avoidCollisions: false,
                  }}
                  content={<TooltipContent d={reference} dp={2} />}
                >
                  <circle {...props} />
                </Tooltip>
              )}
            />
          )}
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
                  <CustomTooltip
                    d={payload[0].payload as TransformedChartData}
                    viewBox={viewBox as any}
                    x={coordinate?.x}
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
