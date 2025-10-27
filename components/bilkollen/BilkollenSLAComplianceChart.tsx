'use client';

import { PieChartCustom, PieSlice } from '@/components/overview/PieChart';
import { ChartConfig } from '@/components/ui/chart';

interface ChartData {
  slaCompliancePercent: number;
}

const chartConfig = {
  inomSLA: {
    label: 'Inom SLA',
    color: 'hsl(var(--primary))',
  },
  overSLA: {
    label: 'Över SLA',
    color: 'hsl(var(--muted))',
  },
} satisfies ChartConfig;

export function BilkollenSLAComplianceChart({ data }: { data: ChartData }) {
  const chartData: PieSlice[] = [
    { name: 'Inom SLA', value: data.slaCompliancePercent, fill: chartConfig.inomSLA.color },
    { name: 'Över SLA', value: 100 - data.slaCompliancePercent, fill: chartConfig.overSLA.color },
  ];

  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <PieChartCustom
      chartConfig={chartConfig}
      chartData={chartData}
      totalValue={totalValue}
    />
  );
}
