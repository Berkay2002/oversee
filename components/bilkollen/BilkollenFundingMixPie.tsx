'use client';

import { PieChartCustom, PieSlice } from '@/components/overview/PieChart';
import { ChartConfig } from '@/components/ui/chart';

interface ChartData {
  fundingSource: 'insurance' | 'internal' | 'customer';
  count: number;
}

const chartConfig = {
  insurance: {
    label: 'Försäkring',
    color: 'hsl(var(--primary))',
  },
  internal: {
    label: 'Internt',
    color: 'hsl(var(--secondary))',
  },
  customer: {
    label: 'Kund',
    color: 'hsl(var(--muted))',
  },
} satisfies ChartConfig;

export function BilkollenFundingMixPie({ data }: { data: ChartData[] }) {
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
}
