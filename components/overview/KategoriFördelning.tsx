'use client';

import { Pie, PieChart, Cell, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { KategoriData } from '@/app/(authenticated)/oversikt/actions';

export interface KategoriFördelningProps {
  data: KategoriData[];
}

export function KategoriFördelning({ data }: KategoriFördelningProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
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

  // Sort data by report count descending
  const sortedData = [...data].sort((a, b) => b.rapport_antal - a.rapport_antal);

  // Build dynamic chart config using database colors
  const chartConfig: ChartConfig = sortedData.reduce(
    (acc, item, index) => {
      const key = `category_${index}`;
      acc[key] = {
        label: item.kategori_namn,
        color: item.color, // Use actual database color
      };
      return acc;
    },
    {} as ChartConfig
  );

  // Transform data for recharts using database colors
  const chartData = sortedData.map((item, index) => ({
    name: item.kategori_namn,
    value: item.rapport_antal,
    fill: item.color, // Use actual database color
    configKey: `category_${index}`,
  }));

  const totalReports = data.reduce((sum, item) => sum + item.rapport_antal, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Rapporter per kategori</CardTitle>
        <CardDescription>
          {totalReports} totalt antal rapporter över {data.length} kategorier
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{name}:</span>
                        <span className="font-bold">{value}</span>
                        <span className="text-muted-foreground text-xs">
                          ({((Number(value) / totalReports) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
                className="transition-all duration-300 hover:scale-105"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate">
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.value} ({((item.value / totalReports) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
