'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig } from '@/components/ui/chart';
import { PieChartCustom, PieSlice } from '@/components/overview/PieChart';

export function KategoriFordelningDemo() {
  const data = [
    { kategori_namn: 'Mekanik', rapport_antal: 45, color: 'hsl(var(--chart-1))' },
    { kategori_namn: 'Elektronik', rapport_antal: 25, color: 'hsl(var(--chart-2))' },
    { kategori_namn: 'Kaross', rapport_antal: 15, color: 'hsl(var(--chart-3))' },
    { kategori_namn: 'Interiör', rapport_antal: 10, color: 'hsl(var(--chart-4))' },
    { kategori_namn: 'Övrigt', rapport_antal: 5, color: 'hsl(var(--chart-5))' },
  ];

  const chartConfig: ChartConfig = data.reduce(
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

  const chartData: PieSlice[] = data.map((item) => ({
    name: item.kategori_namn,
    value: item.rapport_antal,
    fill: item.color,
  }));

  const totalReports = data.reduce(
    (sum, item) => sum + item.rapport_antal,
    0
  );

  return (
    <div className="relative my-6">
      <Card className="flex flex-col w-full">
        <CardHeader>
          <CardTitle>Rapporter per kategori</CardTitle>
          <CardDescription>
            {totalReports} totalt antal rapporter över {data.length} kategorier
          </CardDescription>
        </CardHeader>
        <PieChartCustom
          chartConfig={chartConfig}
          chartData={chartData}
          totalValue={totalReports}
        />
      </Card>
    </div>
  );
}
