'use client';

import { Pie, PieChart, Cell, Legend, ResponsiveContainer } from 'recharts';
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
import { CategoryData } from '@/app/(authenticated)/oversikt/actions';

export interface CategoryBreakdownProps {
  data: CategoryData[];
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reports by Category</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          No reports to display
        </CardContent>
      </Card>
    );
  }

  // Build dynamic chart config from data
  const chartConfig: ChartConfig = data.reduce(
    (acc, item, index) => {
      const key = `category_${index}`;
      acc[key] = {
        label: item.category_name,
        color: item.color,
      };
      return acc;
    },
    {} as ChartConfig
  );

  // Transform data for recharts
  const chartData = data.map((item, index) => ({
    name: item.category_name,
    value: item.report_count,
    fill: item.color,
    configKey: `category_${index}`,
  }));

  const totalReports = data.reduce((sum, item) => sum + item.report_count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports by Category</CardTitle>
        <CardDescription>
          {totalReports} total reports across {data.length} categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
