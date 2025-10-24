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
import { MånadstrendData } from '@/app/(authenticated)/oversikt/actions';

export interface MånadsTrenderProps {
  data: MånadstrendData[];
}

const chartConfig = {
  rapport_antal: {
    label: 'Rapporter',
    color: 'hsl(var(--chart-1))',
  },
  genomsnitt_dagar: {
    label: 'Genomsnitt Dagar',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function MånadsTrender({ data }: MånadsTrenderProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Månadstrender</CardTitle>
          <CardDescription>Ingen data tillgänglig</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          Ingen trenddata att visa
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Månadstrender</CardTitle>
        <CardDescription>
          Antal rapporter och genomsnittliga reparationsdagar spårade över tid
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full sm:h-[350px]"
        >
          <AreaChart
            data={data}
            margin={{ top: 10, right: 12, left: 12, bottom: 0 }}
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
              dataKey="månad"
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
