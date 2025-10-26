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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useMobile } from '@/hooks/use-mobile';

export interface DailyTrendData {
  date: string;
  count: number;
}

export interface WeeklyTrendData {
  week: string;
  count: number;
}

export interface MonthlyTrendData {
  month: string;
  count: number;
}

export interface BilkollenWeeklyTrendProps {
  dailyData: DailyTrendData[];
  weeklyData: WeeklyTrendData[];
  monthlyData: MonthlyTrendData[];
}

type Period = 'daily' | 'weekly' | 'monthly';

const chartConfig = {
  count: {
    label: 'Antal ärenden',
    color: '#2563eb',
  },
} satisfies ChartConfig;

const periodLabels: Record<Period, { title: string; description: string }> = {
  daily: { title: 'Ärenden per dag', description: 'Trend för de senaste 30 dagarna' },
  weekly: { title: 'Ärenden per vecka', description: 'Trend för de senaste 12 veckorna' },
  monthly: { title: 'Ärenden per månad', description: 'Trend för de senaste 12 månaderna' },
};

export function BilkollenWeeklyTrend({ dailyData, weeklyData, monthlyData }: BilkollenWeeklyTrendProps) {
  const isMobile = useMobile();
  const [period, setPeriod] = React.useState<Period>('daily');

  // Select the appropriate data based on period
  const chartData = React.useMemo(() => {
    switch (period) {
      case 'daily':
        return dailyData.map(d => ({ label: d.date, count: d.count }));
      case 'weekly':
        return weeklyData.map(d => ({ label: d.week, count: d.count }));
      case 'monthly':
        return monthlyData.map(d => ({ label: d.month, count: d.count }));
      default:
        return [];
    }
  }, [period, dailyData, weeklyData, monthlyData]);

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>{periodLabels[period].title}</CardTitle>
            <CardDescription>{periodLabels[period].description}</CardDescription>
          </div>
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Per dag</SelectItem>
              <SelectItem value="weekly">Per vecka</SelectItem>
              <SelectItem value="monthly">Per månad</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          Ingen trenddata att visa
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{periodLabels[period].title}</CardTitle>
          <CardDescription>{periodLabels[period].description}</CardDescription>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Per dag</SelectItem>
            <SelectItem value="weekly">Per vecka</SelectItem>
            <SelectItem value="monthly">Per månad</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full sm:h-[350px]"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 12,
              left: isMobile ? -16 : 12,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="50%"
                  stopColor="var(--color-count)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-count)"
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
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={isMobile ? 10 : 32}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              hide={isMobile}
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
              dataKey="count"
              type="monotone"
              fill="url(#fillCount)"
              stroke="var(--color-count)"
              strokeWidth={2}
              className="transition-all hover:opacity-80"
              animationDuration={1000}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
