import { Suspense } from 'react';
import { NyckeltalKort } from '@/components/overview/NyckeltalKort';
import { KategoriFordelning } from '@/components/overview/KategoriFordelning';
import { TeknikerPrestation } from '@/components/overview/TeknikerPrestation';
import { Dagstrender } from '@/components/overview/Dagstrender';
import { ToppProblem } from '@/components/overview/ToppProblem';
import {
  hamtaInstrumentpanelNyckeltal,
  hamtaKategoriFordelning,
  hamtaTeknikerPrestation,
  hamtaDagstrender,
  hamtaToppRegistreringar,
} from '@/lib/actions/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function NyckeltalKortSkelett() {
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

function DiagramSkelett() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

interface OversiktSidaProps {
  params: Promise<{ orgId: string }>;
}

export default async function OversiktSida({ params }: OversiktSidaProps) {
  const { orgId } = await params;

  // Fetch all dashboard data in parallel
  const [kpis, categories, technicians, trends, topIssues] = await Promise.all([
    hamtaInstrumentpanelNyckeltal(orgId),
    hamtaKategoriFordelning(orgId),
    hamtaTeknikerPrestation(orgId),
    hamtaDagstrender(orgId),
    hamtaToppRegistreringar(orgId),
  ]);

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Översikt</h1>
        <p className="text-muted-foreground">
          Instrumentpanel med rapportöversikt och statistik
        </p>
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

        <Suspense fallback={<NyckeltalKortSkelett />}>
          <NyckeltalKort
            totaltAntalRapporter={kpis.totaltAntalRapporter}
            genomsnittDagar={kpis.genomsnittDagar}
            maxDagar={kpis.maxDagar}
            aktivaKategorier={kpis.aktivaKategorier}
          />
        </Suspense>
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

        <Suspense fallback={<DiagramSkelett />}>
          <Dagstrender data={trends} />
        </Suspense>
      </section>

      {/* Breakdown Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Fördelning
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<DiagramSkelett />}>
            <KategoriFordelning data={categories} />
          </Suspense>

          <Suspense fallback={<DiagramSkelett />}>
            <TeknikerPrestation data={technicians} />
          </Suspense>
        </div>
      </section>

      {/* Details Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Detaljer
          </h2>
          <div className="h-px flex-1 bg-linear-to-l from-border to-transparent" />
        </div>

        <Suspense fallback={<DiagramSkelett />}>
          <ToppProblem data={topIssues} />
        </Suspense>
      </section>
    </div>
  );
}
