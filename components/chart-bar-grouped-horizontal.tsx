"use client"

import { Bar, BarChart, XAxis, YAxis, Legend } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartBarGroupedHorizontalProps<T> {
  data: T[];
  categoryKey: keyof T;
  bars: {
    dataKey: keyof T;
    color: string;
  }[];
}

export function ChartBarGroupedHorizontal<T>({
  data,
  categoryKey,
  bars,
}: ChartBarGroupedHorizontalProps<T>) {
  const chartConfig = bars.reduce((acc, bar) => {
    acc[bar.dataKey as string] = {
      label: bar.dataKey as string,
      color: bar.color,
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          left: 12,
        }}
      >
        <XAxis type="number" hide />
        <YAxis
          dataKey={categoryKey as string}
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Legend />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey as string}
            dataKey={bar.dataKey as string}
            fill={bar.color}
            radius={4}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
