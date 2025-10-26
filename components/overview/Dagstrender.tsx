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
import { DagstrendData, VeckotrendData, ManadstrendData } from '@/lib/actions/dashboard';

export interface DagstrenderProps {
  dailyData: DagstrendData[];
  weeklyData: VeckotrendData[];
  monthlyData: ManadstrendData[];
}

type Period = 'daily' | 'weekly' | 'monthly';

const chartConfig = {
  rapport_antal: {
    label: 'Rapporter',
    color: '#2563eb',
  },
  genomsnitt_dagar: {
    label: 'Genomsnitt Dagar',
    color: '#93c5fd',
  },
} satisfies ChartConfig;

const periodLabels: Record<Period, { title: string; description: string }> = {
  daily: {
    title: 'Dagstrender',
    description: 'Antal rapporter och genomsnittliga reparationsdagar (senaste 30 dagarna)'
  },
  weekly: {
    title: 'Veckotrender',
    description: 'Antal rapporter och genomsnittliga reparationsdagar (senaste 12 veckorna)'
  },
  monthly: {
    title: 'Månadstrender',
    description: 'Antal rapporter och genomsnittliga reparationsdagar (senaste 12 månaderna)'
  },
};

export function Dagstrender({ dailyData, weeklyData, monthlyData }: DagstrenderProps) {
  const isMobile = useMobile();
  const [period, setPeriod] = React.useState<Period>('daily');

  // Transform data based on selected period
  const chartData = React.useMemo(() => {
    switch (period) {
      case 'daily':
        return dailyData.map(d => ({
          label: d.dag,
          rapport_antal: d.rapport_antal,
          genomsnitt_dagar: d.genomsnitt_dagar
        }));
      case 'weekly':
        return weeklyData.map(d => ({
          label: d.vecka,
          rapport_antal: d.rapport_antal,
          genomsnitt_dagar: d.genomsnitt_dagar
        }));
      case 'monthly':
        return monthlyData.map(d => ({
          label: d.manad,
          rapport_antal: d.rapport_antal,
          genomsnitt_dagar: d.genomsnitt_dagar
        }));
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
              <linearGradient id="fillRapporter" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-rapport_antal)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="50%"
                  stopColor="var(--color-rapport_antal)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-rapport_antal)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillGenomsnittDagar" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-genomsnitt_dagar)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="50%"
                  stopColor="var(--color-genomsnitt_dagar)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-genomsnitt_dagar)"
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
              tickFormatter={(value) => {
                if (period === 'monthly') {
                  // Format YYYY-MM as "Jan 2025"
                  const [year, month] = value.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1);
                  return date.toLocaleDateString('sv-SE', {
                    month: 'short',
                    year: isMobile ? undefined : 'numeric',
                  });
                }
                const date = new Date(value);
                if (isMobile) {
                  return date.toLocaleDateString('sv-SE', {
                    month: 'short',
                    day: 'numeric',
                  });
                }
                return date.toLocaleDateString('sv-SE');
              }}
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
              dataKey="rapport_antal"
              type="monotone"
              fill="url(#fillRapporter)"
              stroke="var(--color-rapport_antal)"
              strokeWidth={2}
              stackId="a"
              className="transition-all hover:opacity-80"
              animationDuration={1000}
            />
            <Area
              dataKey="genomsnitt_dagar"
              type="monotone"
              fill="url(#fillGenomsnittDagar)"
              stroke="var(--color-genomsnitt_dagar)"
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
