'use client';

import * as React from 'react';
import { PieChartCustom, PieSlice } from '@/components/overview/PieChart';
import { ChartConfig } from '@/components/ui/chart';
import { FUNDING_SOURCE_COLORS } from '@/lib/colors';

interface ChartData {
  fundingSource: 'insurance' | 'internal' | 'customer';
  count: number;
}

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

export const BilkollenFundingMixPie = React.memo(function BilkollenFundingMixPie({ data }: { data: ChartData[] }) {
  const chartData: PieSlice[] = data.map((item) => ({
    name: chartConfig[item.fundingSource].label,
    value: item.count,
    fill: chartConfig[item.fundingSource].color,
  }));

  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <PieChartCustom
      chartConfig={chartConfig}
      chartData={chartData}
      totalValue={totalValue}
    />
  );
});
