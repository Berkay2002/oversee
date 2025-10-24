import { Suspense } from 'react';
import { KPICards } from '@/components/overview/KPICards';
import { CategoryBreakdown } from '@/components/overview/CategoryBreakdown';
import { TechnicianPerformance } from '@/components/overview/TechnicianPerformance';
import { MonthlyTrends } from '@/components/overview/MonthlyTrends';
import { TopIssues } from '@/components/overview/TopIssues';
import {
  getDashboardKPIs,
  getCategoryBreakdown,
  getTechnicianPerformance,
  getMonthlyTrends,
  getTopRegistrations,
} from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function KPICardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export default async function OversiktPage() {
  // Fetch all dashboard data in parallel
  const [kpis, categories, technicians, trends, topIssues] = await Promise.all([
    getDashboardKPIs(),
    getCategoryBreakdown(),
    getTechnicianPerformance(),
    getMonthlyTrends(),
    getTopRegistrations(),
  ]);

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Översikt</h1>
        <p className="text-muted-foreground">
          Dashboard with reports overview and statistics
        </p>
      </div>

      {/* Overview Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>

        <Suspense fallback={<KPICardsSkeleton />}>
          <KPICards
            totalReports={kpis.totalReports}
            avgDays={kpis.avgDays}
            maxDays={kpis.maxDays}
            activeCategories={kpis.activeCategories}
          />
        </Suspense>
      </section>

      {/* Trends Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Trends
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>

        <Suspense fallback={<ChartSkeleton />}>
          <MonthlyTrends data={trends} />
        </Suspense>
      </section>

      {/* Breakdown Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Breakdown
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<ChartSkeleton />}>
            <CategoryBreakdown data={categories} />
          </Suspense>

          <Suspense fallback={<ChartSkeleton />}>
            <TechnicianPerformance data={technicians} />
          </Suspense>
        </div>
      </section>

      {/* Details Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>

        <Suspense fallback={<ChartSkeleton />}>
          <TopIssues data={topIssues} />
        </Suspense>
      </section>
    </div>
  );
}
