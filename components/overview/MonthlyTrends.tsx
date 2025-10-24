'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
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
          Report count and average days over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillReports" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-report_count)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-report_count)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillAvgDays" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-avg_days)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-avg_days)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="report_count"
              type="natural"
              fill="url(#fillReports)"
              stroke="var(--color-report_count)"
              stackId="a"
            />
            <Area
              dataKey="avg_days"
              type="natural"
              fill="url(#fillAvgDays)"
              stroke="var(--color-avg_days)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
