'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, TrendingUp, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      accentColor: 'border-primary/20',
    },
    {
      title: 'Average Days',
      value: avgDays.toFixed(1),
      icon: Clock,
      description: 'Days taken on average',
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
      accentColor: 'border-chart-2/20',
    },
    {
      title: 'Maximum Time',
      value: `${maxDays} days`,
      icon: TrendingUp,
      description: 'Longest repair duration',
      iconBg: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
      accentColor: 'border-chart-3/20',
    },
    {
      title: 'Active Categories',
      value: activeCategories.toLocaleString(),
      icon: FolderKanban,
      description: 'Problem categories',
      iconBg: 'bg-accent/20',
      iconColor: 'text-accent-foreground',
      accentColor: 'border-accent/30',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.title}
            className={cn(
              'transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
              'border-l-4',
              kpi.accentColor
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold">
                {kpi.title}
              </CardTitle>
              <div className={cn('rounded-lg p-2', kpi.iconBg)}>
                <Icon className={cn('h-5 w-5', kpi.iconColor)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {kpi.value}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
