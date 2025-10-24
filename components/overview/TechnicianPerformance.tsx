'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';
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

  // Build dynamic chart config with technician colors
  const dynamicChartConfig: ChartConfig = {
    report_count: {
      label: 'Reports',
      color: 'hsl(var(--chart-1))',
    },
    avg_days: {
      label: 'Avg Days',
      color: 'hsl(var(--chart-2))',
    },
  };

  // Add each technician with their color
  topTechnicians.forEach((tech, index) => {
    dynamicChartConfig[`tech_${index}`] = {
      label: tech.technician_name,
      color: tech.color || '#6366f1',
    };
  });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
        <CardDescription>
          Top {topTechnicians.length} technicians by report count and average days
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={dynamicChartConfig} className="h-[400px] w-full">
          <BarChart
            data={topTechnicians}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="technician_name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={100}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              className="font-medium"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{chartConfig[name as keyof typeof chartConfig]?.label || name}:</span>
                      <span className="font-bold">{value}</span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="report_count"
              fill="var(--color-report_count)"
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
              className="transition-all hover:opacity-80"
            >
              <LabelList
                dataKey="report_count"
                position="right"
                className="fill-foreground text-xs font-semibold"
              />
            </Bar>
            <Bar
              dataKey="avg_days"
              fill="var(--color-avg_days)"
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
              className="transition-all hover:opacity-80"
            >
              <LabelList
                dataKey="avg_days"
                position="right"
                className="fill-foreground text-xs font-semibold"
                formatter={(value: number) => value.toFixed(1)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
