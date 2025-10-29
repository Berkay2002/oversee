'use client';

import * as React from 'react';
import { ChartBarHorizontal } from '@/components/chart-bar-horizontal';
import { INSURANCE_STATUS_COLORS } from '@/lib/colors';

interface ChartData {
  status: 'pending' | 'approved' | 'rejected';
  count: number;
}

export const BilkollenInsuranceStatusFunnel = React.memo(function BilkollenInsuranceStatusFunnel({ data }: { data: ChartData[] }) {
  const chartData = data.map((item) => ({
    ...item,
    fill: INSURANCE_STATUS_COLORS[item.status],
  }));

  return (
    <ChartBarHorizontal
      data={chartData}
      dataKey="count"
      categoryKey="status"
    />
  );
});
