'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { MonthlyTrendData } from '@/app/(authenticated)/oversikt/actions';

export interface MonthlyTrendsProps {
  data: MonthlyTrendData[];
}

const chartConfig = {
  report_count: {
    label: 'Reports',
    color: 'hsl(var(--chart-1))',
  },
  avg_days: {
    label: 'Avg Days',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function MonthlyTrends({ data }: MonthlyTrendsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          No trend data to display
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
        <CardDescription>
          Report count and average repair days tracked over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 12, left: 12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillReports" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-report_count)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="50%"
                  stopColor="var(--color-report_count)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-report_count)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillAvgDays" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-avg_days)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="50%"
                  stopColor="var(--color-avg_days)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-avg_days)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {chartConfig[name as keyof typeof chartConfig]?.label}:
                      </span>
                      <span className="font-bold">{value}</span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="report_count"
              type="monotone"
              fill="url(#fillReports)"
              stroke="var(--color-report_count)"
              strokeWidth={2}
              stackId="a"
              className="transition-all hover:opacity-80"
              animationDuration={1000}
            />
            <Area
              dataKey="avg_days"
              type="monotone"
              fill="url(#fillAvgDays)"
              stroke="var(--color-avg_days)"
              strokeWidth={2}
              stackId="b"
              className="transition-all hover:opacity-80"
              animationDuration={1000}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
