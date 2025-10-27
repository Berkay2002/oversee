"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartBarVerticalProps<T> {
  data: T[];
  dataKey: keyof T;
  categoryKey: keyof T;
}

export function ChartBarVertical<T extends { fill?: string }>({
  data,
  dataKey,
  categoryKey,
}: ChartBarVerticalProps<T>) {
  const chartConfig = {
    [dataKey as string]: {
      label: "Value",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={categoryKey as string}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey={dataKey as string} radius={8}>
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
