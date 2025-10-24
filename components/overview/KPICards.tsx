'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, TrendingUp, FolderKanban } from 'lucide-react';

export interface KPICardsProps {
  totalReports: number;
  avgDays: number;
  maxDays: number;
  activeCategories: number;
}

export function KPICards({
  totalReports,
  avgDays,
  maxDays,
  activeCategories,
}: KPICardsProps) {
  const kpis = [
    {
      title: 'Total Reports',
      value: totalReports.toLocaleString(),
      icon: FileText,
      description: 'All time reports',
    },
    {
      title: 'Average Days',
      value: avgDays.toFixed(1),
      icon: Clock,
      description: 'Days taken on average',
    },
    {
      title: 'Maximum Time',
      value: `${maxDays} days`,
      icon: TrendingUp,
      description: 'Longest repair duration',
    },
    {
      title: 'Active Categories',
      value: activeCategories.toLocaleString(),
      icon: FolderKanban,
      description: 'Problem categories',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
