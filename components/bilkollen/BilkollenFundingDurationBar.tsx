'use client';

import { ChartBarHorizontal } from '@/components/chart-bar-horizontal';
import { FUNDING_SOURCE_COLORS } from '@/lib/colors';

interface ChartData {
  fundingSource: 'insurance' | 'internal' | 'customer';
  avgProcessingDays: number;
}

export function BilkollenFundingDurationBar({ data }: { data: ChartData[] }) {
  const chartData = data.map((item) => ({
    ...item,
    fill: FUNDING_SOURCE_COLORS[item.fundingSource],
  }));

  return (
    <ChartBarHorizontal
      data={chartData}
      dataKey="avgProcessingDays"
      categoryKey="fundingSource"
    />
  );
}
