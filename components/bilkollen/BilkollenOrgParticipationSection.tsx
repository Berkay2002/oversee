'use client';

import * as React from 'react';
import { OrgParticipationResponse } from '@/types/org-participation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartBarHorizontal } from '@/components/chart-bar-horizontal';
import { ChartBarVertical } from '@/components/chart-bar-vertical';
import { getHandlerColor } from '@/lib/colors';

// Placeholder for the individual chart components we will create next
const OrgActiveMembersStat = ({ data }: { data: OrgParticipationResponse }) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle>Aktivt engagerade medarbetare</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold">
        {data.activeHandlersCount} av {data.totalMembers}
      </div>
      <p className="text-xs text-muted-foreground">
        ({data.activeHandlerPercent.toFixed(0)}%) hanterar aktiva ärenden just nu.
      </p>
    </CardContent>
  </Card>
);

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: {
      skillCount: number;
      skills: string[];
    };
  }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border p-2 rounded-md shadow-lg">
        <p className="font-bold">{label}</p>
        <p>Antal kompetenser: {data.skillCount}</p>
        {data.skills && data.skills.length > 0 && (
          <div>
            <p className="font-semibold mt-2">Kompetenser:</p>
            <ul className="list-disc pl-4">
              {data.skills.map((skill: string, index: number) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
};

const OrgSkillCoverageChart = ({
  data,
  allHandlerIds,
}: {
  data: OrgParticipationResponse;
  allHandlerIds: string[];
}) => {
  const chartData = data.skillCoverage.map((item) => ({
    ...item,
    fill: getHandlerColor(item.userId, allHandlerIds),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Antal kompetenser per medarbetare</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartBarHorizontal
          data={chartData}
          dataKey="skillCount"
          categoryKey="name"
          customTooltip={<CustomTooltip />}
        />
      </CardContent>
    </Card>
  );
};


const OrgActiveLoadChart = ({
  data,
  allHandlerIds,
}: {
  data: OrgParticipationResponse;
  allHandlerIds: string[];
}) => {
  const chartData = data.activeCasesPerHandler.map((item) => ({
    ...item,
    fill: getHandlerColor(item.userId, allHandlerIds),
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ärendebelastning per handläggare</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartBarHorizontal data={chartData} dataKey="openCaseCount" categoryKey="name" />
      </CardContent>
    </Card>
  );
};

const OrgRecentIntakeChart = ({
  data,
  allHandlerIds,
}: {
  data: OrgParticipationResponse;
  allHandlerIds: string[];
}) => {
  const chartData = data.recentIntakePerHandler.map((item) => ({
    ...item,
    fill: getHandlerColor(item.userId, allHandlerIds),
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ny aktivitetsfördelning senaste 30 dagar</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartBarVertical data={chartData} dataKey="newCasesLast30d" categoryKey="name" />
      </CardContent>
    </Card>
  );
};


interface BilkollenOrgParticipationSectionProps {
  orgId: string;
}

export function BilkollenOrgParticipationSection({
  orgId,
}: BilkollenOrgParticipationSectionProps) {
  const [data, setData] = React.useState<OrgParticipationResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const allHandlerIds = React.useMemo(() => {
    if (!data) return [];
    const handlerIds = new Set<string>();
    data.activeCasesPerHandler.forEach((item) => handlerIds.add(item.userId));
    data.skillCoverage.forEach((item) => handlerIds.add(item.userId));
    data.recentIntakePerHandler.forEach((item) => handlerIds.add(item.userId));
    return Array.from(handlerIds);
  }, [data]);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analytics/org-participation?orgId=${orgId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const participationData = await response.json();
        setData(participationData);
      } catch (error) {
        console.error('Error fetching org participation data:', error);
        toast.error('Kunde inte hämta data för personaldeltagande');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orgId]);

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full lg:col-span-3" />
        <Skeleton className="h-96 w-full lg:col-span-2" />
        <Skeleton className="h-96 w-full lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <OrgActiveMembersStat data={data} />
      </div>
      <div className="lg:col-span-3">
        <OrgSkillCoverageChart data={data} allHandlerIds={allHandlerIds} />
      </div>
      <div className="lg:col-span-2">
        <OrgActiveLoadChart data={data} allHandlerIds={allHandlerIds} />
      </div>
      <div className="lg:col-span-2">
        <OrgRecentIntakeChart data={data} allHandlerIds={allHandlerIds} />
      </div>
    </div>
  );
}
