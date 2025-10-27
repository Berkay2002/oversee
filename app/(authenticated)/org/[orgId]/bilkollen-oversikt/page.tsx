'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getVehicleCaseStatistics,
  getOrgMembers,
  type VehicleCaseStatistics,
} from '@/lib/actions/vehicle';
import { useOrg } from '@/lib/org/context';
import { toast } from 'sonner';
import { BilkollenMetrics } from '@/components/bilkollen/BilkollenMetrics';
import { BilkollenWeeklyTrend } from '@/components/bilkollen/BilkollenWeeklyTrend';
import { BilkollenFundingSource } from '@/components/bilkollen/BilkollenFundingSource';
import { BilkollenInsuranceStatus } from '@/components/bilkollen/BilkollenInsuranceStatus';
import { BilkollenHandlerStats } from '@/components/bilkollen/BilkollenHandlerStats';
import { BilkollenSLASection } from '@/components/bilkollen/BilkollenSLASection';
import { BilkollenWIPSection } from '@/components/bilkollen/BilkollenWIPSection';
import { BilkollenFlowSection } from '@/components/bilkollen/BilkollenFlowSection';

export default function BilkollenOversiktPage() {
  const { activeOrg } = useOrg();
  const orgId = activeOrg.id;

  const [statistics, setStatistics] = React.useState<VehicleCaseStatistics | null>(null);
  const [members, setMembers] = React.useState<Array<{ user_id: string; name: string }>>([]);
  const [handlerFilter, setHandlerFilter] = React.useState<string>('all');
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch members and statistics
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [membersData, statsData] = await Promise.all([
          getOrgMembers(orgId),
          getVehicleCaseStatistics(
            orgId,
            handlerFilter === 'all' ? undefined : handlerFilter
          ),
        ]);
        setMembers(membersData);
        setStatistics(statsData);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        toast.error('Kunde inte hämta statistik');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orgId, handlerFilter]);

  if (isLoading || !statistics) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
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
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bilkollen Översikt</h1>
          <p className="text-muted-foreground">
            Statistik och analys av fordonärenden
          </p>
        </div>

        {/* Handler filter */}
        <Select value={handlerFilter} onValueChange={setHandlerFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Välj handläggare" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla handläggare</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.user_id} value={member.user_id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Översikt
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>

        <BilkollenMetrics
          totalCases={statistics.totalCases}
          ongoingCases={statistics.ongoingCases}
          archivedCases={statistics.archivedCases}
          avgProcessingDays={statistics.avgProcessingDays}
        />
      </section>

      {/* Flow Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Flöde genom processen
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>
        <BilkollenFlowSection orgId={orgId} />
      </section>

      {/* Trends Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Trender
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>

        <BilkollenWeeklyTrend
          dailyData={statistics.casesPerDay}
          weeklyData={statistics.casesPerWeek}
          monthlyData={statistics.casesPerMonth}
        />
      </section>

      {/* Insurance Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Försäkring & Betalning
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <BilkollenFundingSource data={statistics.byFundingSource} />
          <BilkollenInsuranceStatus data={statistics.byInsuranceStatus} />
        </div>
      </section>

      {/* SLA Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Servicehastighet (SLA)
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>
        <BilkollenSLASection orgId={orgId} />
      </section>

      {/* WIP Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Belastning just nu (WIP)
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>
        <BilkollenWIPSection
          orgId={orgId}
          allHandlerIds={members.map((m) => m.user_id)}
        />
        <BilkollenHandlerStats
          data={statistics.perHandlerStats}
          allHandlerIds={members.map((m) => m.user_id)}
        />
      </section>
    </div>
  );
}
