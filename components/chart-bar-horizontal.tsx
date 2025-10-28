"use client"

import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartBarHorizontalProps<T> {
  data: T[];
  dataKey: keyof T;
  categoryKey: keyof T;
  customTooltip?: React.ReactElement;
}

export function ChartBarHorizontal<T extends { fill?: string }>({
  data,
  dataKey,
  categoryKey,
  customTooltip,
}: ChartBarHorizontalProps<T>) {
  const chartConfig = {
    [dataKey as string]: {
      label: "Value",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

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
          content={customTooltip || <ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey={dataKey as string} radius={4}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill || chartConfig[dataKey as string].color}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
