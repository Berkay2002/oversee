'use client';

import { ChartBarHorizontal } from '@/components/chart-bar-horizontal';

interface ChartData {
  fundingSource: 'insurance' | 'internal' | 'customer';
  avgProcessingDays: number;
}

export function BilkollenFundingDurationBar({ data }: { data: ChartData[] }) {
  return (
    <ChartBarHorizontal
      data={data}
      dataKey="avgProcessingDays"
      categoryKey="fundingSource"
    />
  );
}
