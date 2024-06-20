import * as Recharts from "recharts";

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
    <div className="h-full w-full flex-shrink-0 transform-gpu">
      <Recharts.ResponsiveContainer width="100%" height="100%">
        <Recharts.LineChart
          data={data}
          margin={{
            top: line.strokeWidth / 2,
            right: 0,
            bottom: line.strokeWidth / 2,
            left: 0,
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
            type="monotone"
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
