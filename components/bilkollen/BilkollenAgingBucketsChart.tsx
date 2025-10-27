'use client';

import { ChartBarHorizontal } from '@/components/chart-bar-horizontal';
import { getColorByIndex } from '@/lib/colors';

interface ChartData {
  bucket: string;
  count: number;
}

export function BilkollenAgingBucketsChart({ data }: { data: ChartData[] }) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: getColorByIndex(index),
  }));

  return (
    <ChartBarHorizontal
      data={chartData}
      dataKey="count"
      categoryKey="bucket"
    />
  );
}
