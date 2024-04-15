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
    <div className="flex flex-col items-end">
      <div className="flex flex-row items-baseline gap-2">
        <TLabelSans>Utilization</TLabelSans>
        <TBody>{formatPercent(new BigNumber(utilization))}</TBody>
      </div>

      <div className="flex flex-row items-baseline gap-2">
        <TLabelSans>APR</TLabelSans>
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
  id: string;
  data: ChartData[];
  reference?: ChartData;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export default function AprLineChart({
  id,
  data,
  reference,
  xAxisLabel,
  yAxisLabel,
}: AprLineChartProps) {
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
  const xyForReferenceDot = useMemo(() => {
    if (!reference) return;

    const { u0, ul, v0, vl } = chartConfig;

    const x = reference.x;
    const xPct = (x - u0) / ul;

    const y = transform(reference.y);
    const yPct = (y - v0) / vl;

    return { x, xPct, y, yPct };
  }, [reference, chartConfig]);

  const referenceDotStyle = useMemo(() => {
    if (!reference) return;
    if (!chartDimensions) return;
    if (!xyForReferenceDot) return;

    const { top, right, bottom, left } = chartDimensions;
    const { xPct, yPct } = xyForReferenceDot;

    return {
      left: `calc(${left}px + ${xPct * 100}% - ${(left + right) * xPct}px)`,
      top: `calc(${top}px + ${(1 - yPct) * 100}% - ${(top + bottom) * (1 - yPct)}px`,
    };
  }, [reference, chartDimensions, xyForReferenceDot]);

  return (
    <div
      ref={containerRef}
      className={cn(
        styles.container,
        "relative h-full w-full transform-gpu overflow-hidden",
      )}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      {/* Mouseover dot */}
      <Tooltip
        rootProps={{ open: showMouseoverDot }}
        portalProps={{ container: containerRef.current }}
        contentProps={{
          className: "!pointer-events-none",
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

      {/* Reference dot */}
      {reference && xyForReferenceDot && referenceDotStyle && (
        <Tooltip
          rootProps={{ open: true }}
          portalProps={{ container: containerRef.current }}
          contentProps={{
            className: cn(
              "!pointer-events-none min-w-max transition-opacity",
              showMouseoverDot && "opacity-0",
            ),
            side: xyForReferenceDot.yPct > 0.5 ? "left" : "top",
            sideOffset: 8,
            avoidCollisions: false,
          }}
          content={
            <TooltipContent utilization={reference.x} apr={reference.y} />
          }
        >
          <div
            className="absolute z-[2] -ml-[4px] -mt-[4px] h-[8px] w-[8px] rounded-full bg-destructive"
            style={referenceDotStyle}
          />
        </Tooltip>
      )}

      <Recharts.ResponsiveContainer
        id={id}
        width="100%"
        height="100%"
        className="relative z-[1]"
      >
        <Recharts.LineChart data={transformedData} onMouseMove={onMouseMove}>
          <Recharts.CartesianGrid
            strokeDasharray="3 2"
            stroke="hsla(var(--muted) / 20%)"
          />
          <Recharts.XAxis
            dataKey="x"
            domain={xAxisDomain}
            type="number"
            tick={{
              fontSize: 12,
              fontFamily: "var(--font-geist-sans)",
              fill: "hsl(var(--muted-foreground))",
            }}
            tickLine={{
              stroke: "transparent",
            }}
            axisLine={{
              stroke:
                "color-mix(in hsl, hsl(var(--secondary)) 25%, hsl(var(--popover)))",
            }}
            unit="%"
          >
            {xAxisLabel && (
              <Recharts.Label
                value={xAxisLabel}
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
            )}
          </Recharts.XAxis>
          <Recharts.YAxis
            ticks={ticks}
            dataKey="y"
            domain={yAxisDomain}
            type="number"
            tick={{
              fontSize: 12,
              fontFamily: "var(--font-geist-sans)",
              fill: "hsl(var(--muted-foreground))",
            }}
            tickLine={{
              stroke: "transparent",
            }}
            tickFormatter={(value: number) =>
              Math.round(inverseTransform(value)).toString()
            }
            axisLine={{
              stroke:
                "color-mix(in hsl, hsl(var(--secondary)) 25%, hsl(var(--popover)))",
            }}
            unit="%"
          >
            {yAxisLabel && (
              <Recharts.Label
                value={yAxisLabel}
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
            )}
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
            strokeWidth={3}
          />
        </Recharts.LineChart>
      </Recharts.ResponsiveContainer>
    </div>
  );
}
