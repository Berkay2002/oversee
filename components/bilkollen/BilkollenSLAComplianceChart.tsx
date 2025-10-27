'use client';

import { PieChartCustom, PieSlice } from '@/components/overview/PieChart';
import { ChartConfig } from '@/components/ui/chart';
import { SLA_STATUS_COLORS } from '@/lib/colors';

interface ChartData {
  slaCompliancePercent: number;
}

const chartConfig = {
  'Inom SLA': {
    label: 'Inom SLA',
    color: SLA_STATUS_COLORS['Inom SLA'],
  },
  'Över SLA': {
    label: 'Över SLA',
    color: SLA_STATUS_COLORS['Över SLA'],
  },
} satisfies ChartConfig;

export function BilkollenSLAComplianceChart({ data }: { data: ChartData }) {
  const chartData: PieSlice[] = [
    {
      name: 'Inom SLA',
      value: data.slaCompliancePercent,
      fill: chartConfig['Inom SLA'].color,
    },
    {
      name: 'Över SLA',
      value: 100 - data.slaCompliancePercent,
      fill: chartConfig['Över SLA'].color,
    },
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
