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
import { PieChartCustom, PieSlice } from '@/components/overview/PieChart';
import { FUNDING_SOURCE_COLORS } from '@/lib/colors';

const chartConfig = {
  insurance: {
    label: 'Försäkring',
    color: FUNDING_SOURCE_COLORS.insurance,
  },
  internal: {
    label: 'Internt',
    color: FUNDING_SOURCE_COLORS.internal,
  },
  customer: {
    label: 'Kund',
    color: FUNDING_SOURCE_COLORS.customer,
  },
} satisfies ChartConfig;

export function BilkollenFundingSourceDemo() {
  const data = {
    insurance: 55,
    internal: 30,
    customer: 15,
  };

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

  return (
    <div className="relative my-6">
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
    </div>
  );
}
