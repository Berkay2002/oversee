'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ChartData {
  weekStart: string;
  avgDays: number;
}

export function BilkollenSLAWeeklyChart({ data }: { data: ChartData[] }) {
  const chartData = data.map(item => ({
    ...item,
    weekStart: new Date(item.weekStart).toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <ChartContainer config={{}} className="h-[250px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="weekStart"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}d`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Line
          dataKey="avgDays"
          type="monotone"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
