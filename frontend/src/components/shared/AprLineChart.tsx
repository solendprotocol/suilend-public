import { useCallback, useMemo, useRef, useState } from "react";

import BigNumber from "bignumber.js";
import * as Recharts from "recharts";
import { CategoricalChartState } from "recharts/types/chart/types";

import styles from "@/components/shared/AprLineChart.module.scss";
import CartesianGridVerticalLine from "@/components/shared/CartesianGridVerticalLine";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import useLineChartDimensions from "@/hooks/useLineChartDimensions";
import { axis, axisLabel, line } from "@/lib/chart";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type ChartData = {
  x: number;
  y: number;
};

interface TooltipContentProps {
  utilization: number;
  apr: number;
}

function TooltipContent({ utilization, apr }: TooltipContentProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <TLabelSans>{formatPercent(new BigNumber(utilization))}</TLabelSans>

      <div className="flex flex-row items-center justify-between gap-4">
        <TLabelSans>Borrow APR</TLabelSans>
        <TBody>{formatPercent(new BigNumber(apr))}</TBody>
      </div>
    </div>
  );
}

interface AprLineChartProps {
  data: ChartData[];
  reference?: ChartData;
}

export default function AprLineChart({ data, reference }: AprLineChartProps) {
  const transform = (value: number) => Math.pow(value, 1 / 2);
  const inverseTransform = (value: number) => Math.pow(value, 2);

  const transformedData = data.map((d) => ({ x: d.x, y: transform(d.y) }));

  // Min/max
  const minX = Math.min(...data.map((d) => d.x));
  const maxX = Math.max(...data.map((d) => d.x));

  const transformedMinY = 0;
  const transformedMaxY = Math.max(...transformedData.map((d) => d.y));

  // Ticks
  const ticksX = Array.from({ length: 5 }).map(
    (_, index, array) => minX + maxX * (index / (array.length - 1)),
  );
  const ticksY = Array.from({ length: 4 }).map(
    (_, index, array) =>
      transformedMinY + transformedMaxY * (index / (array.length - 1)),
  );

  const tickFormatterX = (utilPercent: number) =>
    formatPercent(new BigNumber(utilPercent), { dp: 0 });
  const tickFormatterY = (value: number) =>
    formatPercent(new BigNumber(inverseTransform(value)), { dp: 0 });

  // Domain
  const domainX = useMemo(() => [minX, maxX], [minX, maxX]);
  const domainY = useMemo(
    () => [transformedMinY, transformedMaxY],
    [transformedMinY, transformedMaxY],
  );

  // Chart
  const containerRef = useRef<HTMLDivElement>(null);

  const chartDimensions = useLineChartDimensions(containerRef);
  const chartConfig = useMemo(() => {
    return {
      u0: domainX[0],
      u1: domainX[1],
      ul: domainX[1] - domainX[0],
      v0: domainY[0],
      v1: domainY[1],
      vl: domainY[1] - domainY[0],
    };
  }, [domainX, domainY]);

  // Mouseover
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

  const [mouseChartX, setMouseChartX] = useState<number | undefined>(undefined);
  const getXYForMouseChartX = useCallback(
    (chartX?: number) => {
      if (chartX === undefined) return;
      if (!chartDimensions) return;

      const { width, left } = chartDimensions;
      const { u0, ul, v0, vl } = chartConfig;

      const xPct = (chartX - left) / width;
      const x = u0 + xPct * ul;

      let iMin = transformedData.findIndex((d) => d.x >= x);
      if (iMin === -1) return;

      if (iMin > 0) iMin -= 1;
      let iMax = iMin + 1;
      if (iMax > transformedData.length - 1) iMax -= 1;

      const xMin = transformedData[iMin].x;
      const xMax = transformedData[iMax].x;
      const yMin = transformedData[iMin].y;
      const yMax = transformedData[iMax].y;

      const y = yMin + ((x - xMin) / (xMax - xMin)) * (yMax - yMin);
      const yPct = (y - v0) / vl;

      return { xPct, x, yPct, y };
    },
    [chartDimensions, chartConfig, transformedData],
  );

  const xyForMouseChartX = useMemo(() => {
    if (mouseChartX === undefined) return;

    return getXYForMouseChartX(mouseChartX);
  }, [mouseChartX, getXYForMouseChartX]);

  // Mouseover dot
  const mouseoverDotRef = useRef<HTMLDivElement>(null);
  const onMouseMove = (state: CategoricalChartState) => {
    requestAnimationFrame(() => {
      if (!chartDimensions) return;
      if (state.chartX === undefined) return;
      setMouseChartX(state.chartX);

      const xy = getXYForMouseChartX(state.chartX);
      if (!xy) return;

      const { top, right, bottom, left } = chartDimensions;
      const { xPct, yPct } = xy;

      if (!mouseoverDotRef.current) return;
      mouseoverDotRef.current.style.left = `calc(${left}px + ${xPct * 100}% - ${(left + right) * xPct}px)`;
      mouseoverDotRef.current.style.top = `calc(${top}px + ${(1 - yPct) * 100}% - ${(top + bottom) * (1 - yPct)}px`;
    });
  };

  const showMouseoverDot = isMouseOver && !!xyForMouseChartX;

  // Reference dot
  const referenceDotRef = useRef<SVGCircleElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        styles.container,
        "apr-line-chart relative h-full w-full transform-gpu",
      )}
      is-loading="false"
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      {/* Mouseover dot */}
      <Tooltip
        rootProps={{ open: showMouseoverDot }}
        portalProps={{ container: containerRef.current }}
        contentProps={{
          className: "w-max min-w-[160px] !pointer-events-none",
          side: !!xyForMouseChartX
            ? xyForMouseChartX.xPct > 0.5
              ? "left"
              : "right"
            : undefined,
        }}
        content={
          !!xyForMouseChartX && (
            <TooltipContent
              utilization={xyForMouseChartX.x}
              apr={inverseTransform(xyForMouseChartX.y)}
            />
          )
        }
      >
        <div
          ref={mouseoverDotRef}
          className={cn(
            "absolute z-[3] -ml-[6px] -mt-[6px] h-[12px] w-[12px] rounded-full bg-primary transition-opacity",
            !showMouseoverDot && "opacity-0",
          )}
        />
      </Tooltip>

      <Recharts.ResponsiveContainer
        width="100%"
        height="100%"
        className="relative z-[1]"
      >
        <Recharts.LineChart
          data={transformedData}
          onMouseMove={onMouseMove}
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
            dataKey="x"
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
            dataKey="y"
            ticks={ticksY}
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
            dataKey="y"
            isAnimationActive={false}
            stroke="hsl(var(--foreground))"
            dot={line.dot}
            strokeWidth={line.strokeWidth}
          />
          {reference && (
            <Recharts.ReferenceDot
              x={reference.x}
              y={transform(reference.y)}
              isFront
              fill="hsl(var(--destructive))"
              strokeWidth={0}
              r={4}
              shape={(props: any) => (
                <Tooltip
                  rootProps={{ open: !!referenceDotRef.current }}
                  portalProps={{ container: containerRef.current }}
                  contentProps={{
                    className: cn(
                      "w-max min-w-[160px] !pointer-events-none transition-opacity",
                      showMouseoverDot && "opacity-50",
                    ),
                    side: "top",
                    sideOffset: 8,
                    avoidCollisions: false,
                  }}
                  content={
                    <TooltipContent
                      utilization={reference.x}
                      apr={reference.y}
                    />
                  }
                >
                  <circle ref={referenceDotRef} {...props} cy={props.cy + 1} />
                </Tooltip>
              )}
            />
          )}
        </Recharts.LineChart>
      </Recharts.ResponsiveContainer>
    </div>
  );
}
