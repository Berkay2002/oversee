'use client';

import { ChartBarVertical } from '@/components/chart-bar-vertical';
import { getHandlerColor } from '@/lib/colors';

interface ChartData {
  handlerUserId: string;
  handlerName: string;
  openCount: number;
}

export function BilkollenWIPLoadChart({
  data,
  allHandlerIds,
}: {
  data: ChartData[];
  allHandlerIds: string[];
}) {
  const chartData = data.map((item) => ({
    ...item,
    fill: getHandlerColor(item.handlerUserId, allHandlerIds),
  }));

  return (
    <ChartBarVertical
      data={chartData}
      dataKey="openCount"
      categoryKey="handlerName"
    />
  );
}
