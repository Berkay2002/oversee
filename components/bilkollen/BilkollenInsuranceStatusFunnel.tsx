'use client';

import { ChartBarHorizontal } from '@/components/chart-bar-horizontal';

interface ChartData {
  status: 'pending' | 'approved' | 'rejected';
  count: number;
}

export function BilkollenInsuranceStatusFunnel({ data }: { data: ChartData[] }) {
  return (
    <ChartBarHorizontal
      data={data}
      dataKey="count"
      categoryKey="status"
    />
  );
}
