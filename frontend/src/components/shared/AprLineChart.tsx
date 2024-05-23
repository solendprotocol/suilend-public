import { useCallback, useMemo, useRef, useState } from "react";

import BigNumber from "bignumber.js";
import * as Recharts from "recharts";
import { CategoricalChartState } from "recharts/types/chart/types";

import styles from "@/components/shared/AprLineChart.module.scss";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import useLineChartDimensions from "@/hooks/useLineChartDimensions";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

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

type ChartData = {
  x: number;
  y: number;
};

interface AprLineChartProps {
  data: ChartData[];
  reference?: ChartData;
}

export default function AprLineChart({ data, reference }: AprLineChartProps) {
  // Data
  const transform = (value: number) => Math.pow(value, 1 / 2);
  const inverseTransform = (value: number) => Math.pow(value, 2);

  const transformedData = data.map((d) => ({ x: d.x, y: transform(d.y) }));
  const transformedMaxY = Math.max(...transformedData.map((d) => d.y));

  // Ticks
  const ticksCount = 4;
  const ticks = Array(ticksCount)
    .fill(0)
    .map((_, i) => 0 + transformedMaxY * (i / (ticksCount - 1)));

  const xAxisDomain = useMemo(() => [0, 100], []);
  const yAxisDomain = useMemo(
    () => [ticks[0], ticks[ticks.length - 1]],
    [ticks],
  );

  // Chart
  const containerRef = useRef<HTMLDivElement>(null);

  const chartDimensions = useLineChartDimensions(containerRef);
  const chartConfig = useMemo(() => {
    return {
      u0: xAxisDomain[0],
      u1: xAxisDomain[1],
      ul: xAxisDomain[1] - xAxisDomain[0],
      v0: yAxisDomain[0],
      v1: yAxisDomain[1],
      vl: yAxisDomain[1] - yAxisDomain[0],
    };
  }, [xAxisDomain, yAxisDomain]);

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
      className={cn(styles.container, "relative h-full w-full transform-gpu")}
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
          />
          <Recharts.XAxis
            type="number"
            dataKey="x"
            tickMargin={2}
            tick={{
              fontSize: 11,
              fontFamily: "var(--font-geist-sans)",
              fill: "hsl(var(--muted-foreground))",
            }}
            axisLine={{
              stroke: "hsl(209 36% 28%)", // 25% var(--secondary) on var(--popover)
            }}
            tickLine={{
              stroke: "transparent",
            }}
            domain={xAxisDomain}
            unit="%"
          >
            <Recharts.Label
              value="Utilization"
              offset={-4}
              style={{
                fontSize: 12,
                fontFamily: "var(--font-geist-sans)",
                fontWeight: 400,
                lineHeight: "12px",
                fill: "hsl(var(--muted-foreground))",
              }}
              position="insideBottom"
            />
          </Recharts.XAxis>
          <Recharts.YAxis
            type="number"
            dataKey="y"
            ticks={ticks}
            tickMargin={2}
            tick={{
              fontSize: 11,
              fontFamily: "var(--font-geist-sans)",
              fill: "hsl(var(--muted-foreground))",
            }}
            axisLine={{
              stroke: "hsl(209 36% 28%)", // 25% var(--secondary) on var(--popover)
            }}
            tickLine={{
              stroke: "transparent",
            }}
            tickFormatter={(value: number) =>
              Math.round(inverseTransform(value)).toString()
            }
            domain={yAxisDomain}
            unit="%"
          >
            <Recharts.Label
              value="Borrow APR"
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
          <Recharts.Line
            dataKey="y"
            isAnimationActive={false}
            stroke="hsl(var(--foreground))"
            dot={{
              stroke: "transparent",
              strokeWidth: 0,
              fill: "transparent",
            }}
            strokeWidth={1.5}
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
