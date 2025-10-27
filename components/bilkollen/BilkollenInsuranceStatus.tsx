'use client';

import * as React from 'react';
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
import { useMobile } from '@/hooks/use-mobile';

export interface InsuranceStatusData {
  pending: number;
  approved: number;
  rejected: number;
}

export interface BilkollenInsuranceStatusProps {
  data: InsuranceStatusData;
}

const chartConfig = {
  value: {
    label: 'Antal',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function BilkollenInsuranceStatus({ data }: BilkollenInsuranceStatusProps) {
  const isMobile = useMobile();

  const chartData = [
    { name: 'Väntande', value: data.pending },
    { name: 'Godkänd', value: data.approved },
    { name: 'Nekad', value: data.rejected },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Försäkringsstatus</CardTitle>
          <CardDescription>Status för försäkringsärenden</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          Ingen data tillgänglig
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Försäkringsstatus</CardTitle>
        <CardDescription>Status för försäkringsärenden</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 12,
              left: isMobile ? -16 : 12,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              hide={isMobile}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={[4, 4, 0, 0]}
              className="transition-all hover:opacity-80"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
