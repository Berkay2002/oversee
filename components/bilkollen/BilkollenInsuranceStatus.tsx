'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
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
import { useMobile } from '@/hooks/use-mobile';
import { INSURANCE_STATUS_COLORS } from '@/lib/colors';

export interface InsuranceStatusData {
  pending: number;
  approved: number;
  rejected: number;
}

export interface BilkollenInsuranceStatusProps {
  data: InsuranceStatusData;
}

const chartConfig = {
  pending: {
    label: 'Väntande',
    color: INSURANCE_STATUS_COLORS.pending,
  },
  approved: {
    label: 'Godkänd',
    color: INSURANCE_STATUS_COLORS.approved,
  },
  rejected: {
    label: 'Nekad',
    color: INSURANCE_STATUS_COLORS.rejected,
  },
} satisfies ChartConfig;

export function BilkollenInsuranceStatus({
  data,
}: BilkollenInsuranceStatusProps) {
  const isMobile = useMobile();

  const chartData = [
    { name: 'Väntande', value: data.pending, fill: chartConfig.pending.color },
    { name: 'Godkänd', value: data.approved, fill: chartConfig.approved.color },
    { name: 'Nekad', value: data.rejected, fill: chartConfig.rejected.color },
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
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="name"
                  nameKey="value"
                  indicator="dot"
                />
              }
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
