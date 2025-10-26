'use client';

import * as React from 'react';
import { Pie, PieChart, Cell } from 'recharts';
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

export interface FundingSourceData {
  insurance: number;
  internal: number;
  customer: number;
}

export interface BilkollenFundingSourceProps {
  data: FundingSourceData;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b'];

const chartConfig = {
  insurance: {
    label: 'Försäkring',
    color: '#2563eb',
  },
  internal: {
    label: 'Internt',
    color: '#10b981',
  },
  customer: {
    label: 'Kund',
    color: '#f59e0b',
  },
} satisfies ChartConfig;

export function BilkollenFundingSource({ data }: BilkollenFundingSourceProps) {
  const chartData = [
    { name: 'Försäkring', value: data.insurance, key: 'insurance' },
    { name: 'Internt', value: data.internal, key: 'internal' },
    { name: 'Kund', value: data.customer, key: 'customer' },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kostnadstyp</CardTitle>
          <CardDescription>Fördelning av finansieringskällor</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          Ingen data tillgänglig
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kostnadstyp</CardTitle>
        <CardDescription>Fördelning av finansieringskällor</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartConfig[entry.key as keyof typeof chartConfig]?.color || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
