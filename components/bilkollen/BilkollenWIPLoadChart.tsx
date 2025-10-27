'use client';

'use client';

import { ChartBarHorizontal } from '@/components/chart-bar-horizontal';

interface ChartData {
  handlerName: string;
  openCount: number;
}

export function BilkollenWIPLoadChart({ data }: { data: ChartData[] }) {
  return (
    <ChartBarHorizontal
      data={data}
      dataKey="openCount"
      categoryKey="handlerName"
    />
  );
}
