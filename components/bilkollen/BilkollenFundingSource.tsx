'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig } from '@/components/ui/chart';
import { PieChartCustom, PieSlice } from '../overview/PieChart';

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
  color: 'hsl(var(--chart-1))',
  },
  internal: {
    label: 'Internt',
    color: 'hsl(var(--chart-2))',
  },
  customer: {
    label: 'Kund',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function BilkollenFundingSource({ data }: BilkollenFundingSourceProps) {
  const chartData: PieSlice[] = [
    {
      name: 'Försäkring',
      value: data.insurance,
      fill: chartConfig.insurance.color,
    },
    { name: 'Internt', value: data.internal, fill: chartConfig.internal.color },
    { name: 'Kund', value: data.customer, fill: chartConfig.customer.color },
  ].filter((item) => item.value > 0);

  const totalValue = data.insurance + data.internal + data.customer;

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
    <Card className="flex flex-col w-full">
      <CardHeader>
        <CardTitle>Kostnadstyp</CardTitle>
        <CardDescription>Fördelning av finansieringskällor</CardDescription>
      </CardHeader>
      <PieChartCustom
        chartConfig={chartConfig}
        chartData={chartData}
        totalValue={totalValue}
      />
    </Card>
  );
}
