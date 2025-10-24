'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  Cell,
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
} from '@/components/ui/chart';
import { TechnicianData } from '@/app/(authenticated)/oversikt/actions';

export interface TechnicianPerformanceProps {
  data: TechnicianData[];
}

const chartConfig = {} satisfies ChartConfig;

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
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Technician Performance</CardTitle>
        <CardDescription>
          Top {topTechnicians.length} technicians by report count and average days
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full sm:h-[400px]"
        >
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
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              className="font-medium"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, entry) => (
                    <div className="flex flex-col gap-1">
                      <div className="font-bold">{entry.payload.technician_name}</div>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.payload.color }}
                        />
                        <span className="font-medium">Reports:</span>
                        <span className="font-bold">{entry.payload.report_count}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Avg Days:</span>
                        <span className="font-bold">{entry.payload.avg_days.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="report_count"
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
              className="transition-all hover:opacity-80"
            >
              <LabelList
                dataKey="report_count"
                position="right"
                className="fill-foreground text-xs font-semibold"
              />
              {topTechnicians.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
