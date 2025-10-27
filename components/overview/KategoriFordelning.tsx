'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig } from '@/components/ui/chart';
import { KategoriData } from '@/lib/actions/dashboard';
import { PieChartCustom, PieSlice } from './PieChart';

export interface KategoriFordelningProps {
  data: KategoriData[];
}

export function KategoriFordelning({ data }: KategoriFordelningProps) {
  // Handle no data
  if (!data || data.length === 0) {
  return (
    <Card className="flex flex-col flex-1">
      <CardHeader>
        <CardTitle>Rapporter per kategori</CardTitle>
          <CardDescription>Ingen data tillgänglig</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          Inga rapporter att visa
        </CardContent>
      </Card>
    );
  }

  // Sort categories by report count descending
  const sortedData = [...data].sort(
    (a, b) => b.rapport_antal - a.rapport_antal
  );

  // Build chart config (labels + colors) for ChartContainer's legend/color context
  const chartConfig: ChartConfig = sortedData.reduce(
    (acc, item, index) => {
      const key = `category_${index}`;
      acc[key] = {
        label: item.kategori_namn,
        color: item.color,
      };
      return acc;
    },
    {} as ChartConfig
  );

  // Normalize data for the pie slices
  const chartData: PieSlice[] = sortedData.map((item) => ({
    name: item.kategori_namn,
    value: item.rapport_antal,
    fill: item.color,
  }));

  // Total number of reports (for percentages and header info)
  const totalReports = data.reduce(
    (sum, item) => sum + item.rapport_antal,
    0
  );

  return (
    <Card className="flex flex-col w-full">
      <CardHeader>
        <CardTitle>Rapporter per kategori</CardTitle>
        <CardDescription>
          {totalReports} totalt antal rapporter över {data.length} kategorier
        </CardDescription>
      </CardHeader>

      {/* ultrawide-friendly layout + responsive donut lives in PieChartCustom */}
      <PieChartCustom
        chartConfig={chartConfig}
        chartData={chartData}
        totalValue={totalReports}
      />
    </Card>
  );
}
