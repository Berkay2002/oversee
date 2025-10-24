'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { TechnicianData } from '@/app/(authenticated)/oversikt/actions';

export interface TechnicianPerformanceProps {
  data: TechnicianData[];
}

const chartConfig = {
  report_count: {
    label: 'Reports',
    color: 'hsl(var(--chart-1))',
  },
  avg_days: {
    label: 'Avg Days',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function TechnicianPerformance({ data }: TechnicianPerformanceProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technician Performance</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          No technician data to display
        </CardContent>
      </Card>
    );
  }

  // Sort by report count and take top 10
  const topTechnicians = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
        <CardDescription>
          Top {topTechnicians.length} technicians by report count
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={topTechnicians} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="technician_name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={80}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="report_count"
              fill="var(--color-report_count)"
              radius={4}
            />
            <Bar dataKey="avg_days" fill="var(--color-avg_days)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
