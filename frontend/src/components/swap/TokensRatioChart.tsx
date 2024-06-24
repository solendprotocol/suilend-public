import * as Recharts from "recharts";

import { TLabelSans } from "@/components/shared/Typography";
import { line } from "@/lib/chart";

type ChartData = {
  timestampS: number;
  ratio: number;
};

interface TokensRatioChartProps {
  data: ChartData[];
}

export default function TokensRatioChart({ data }: TokensRatioChartProps) {
  // Min/max
  const minX = Math.min(...data.map((d) => d.timestampS));
  const maxX = Math.max(...data.map((d) => d.timestampS));

  const minY = Math.min(...data.map((d) => d.ratio));
  const maxY = Math.max(...data.map((d) => d.ratio));

  // Domain
  const domainX = [minX, maxX];
  const domainY = [minY, maxY];

  return (
    <div className="relative h-full w-full flex-shrink-0 transform-gpu">
      <div
        className="absolute left-0 right-0 z-[1] h-[1px] border-b border-dashed border-foreground/25"
        style={{ bottom: `${((data[0].ratio - minY) / (maxY - minY)) * 100}%` }}
      >
        <TLabelSans className="absolute left-0 top-1/2 -translate-x-full -translate-y-2/4 pr-1 text-[10px] uppercase text-foreground/25">
          24h
        </TLabelSans>
      </div>

      <Recharts.ResponsiveContainer
        className="relative z-[2]"
        width="100%"
        height="100%"
      >
        <Recharts.LineChart
          data={data}
          margin={{
            top: line.strokeWidth / 2,
            right: line.strokeWidth / 2,
            bottom: line.strokeWidth / 2,
            left: line.strokeWidth / 2,
          }}
        >
          <Recharts.CartesianGrid
            stroke="transparent"
            fill="transparent"
            horizontal={false}
            vertical={false}
          />
          <Recharts.XAxis
            type="number"
            dataKey="timestampS"
            hide
            domain={domainX}
          />
          <Recharts.YAxis type="number" domain={domainY} hide />
          <Recharts.Line
            dataKey="ratio"
            isAnimationActive={false}
            stroke="hsl(var(--foreground))"
            dot={line.dot}
            strokeWidth={line.strokeWidth}
          />
        </Recharts.LineChart>
      </Recharts.ResponsiveContainer>
    </div>
  );
}
