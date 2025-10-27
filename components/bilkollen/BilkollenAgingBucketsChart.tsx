'use client';

import { ChartBarHorizontal } from '@/components/chart-bar-horizontal';

interface ChartData {
  bucket: string;
  count: number;
}

export function BilkollenAgingBucketsChart({ data }: { data: ChartData[] }) {
  return (
    <ChartBarHorizontal
      data={data}
      dataKey="count"
      categoryKey="bucket"
    />
  );
}
