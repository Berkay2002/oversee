'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, TrendingUp, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NyckeltalKortDemo() {
  const kpis = [
    {
      title: 'Totalt antal rapporter',
      value: '1,234',
      icon: FileText,
      description: 'Rapporter genom tiderna',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      accentColor: 'border-primary/20',
    },
    {
      title: 'Genomsnittliga dagar',
      value: '3.4',
      icon: Clock,
      description: 'Dagar tagna i genomsnitt',
      iconBg: 'bg-chart-2/10',
      iconColor: 'text-chart-2',
      accentColor: 'border-chart-2/20',
    },
    {
      title: 'Maximal tid',
      value: '21 dagar',
      icon: TrendingUp,
      description: 'Längsta reparationstid',
      iconBg: 'bg-chart-3/10',
      iconColor: 'text-chart-3',
      accentColor: 'border-chart-3/20',
    },
    {
      title: 'Aktiva kategorier',
      value: '8',
      icon: FolderKanban,
      description: 'Problemkategorier',
      iconBg: 'bg-accent/20',
      iconColor: 'text-accent-foreground',
      accentColor: 'border-accent/30',
    },
  ];

  return (
    <div className="relative my-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.title}
              className={cn(
                'transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
                'border-0',
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
    </div>
  );
}
