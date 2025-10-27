'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { BilkollenSLAWeeklyChart } from './BilkollenSLAWeeklyChart';
import { BilkollenSLAComplianceChart } from './BilkollenSLAComplianceChart';

interface SlaData {
  avgProcessingDays7d: number;
  avgProcessingDays30d: number;
  weeklyProcessingTime: { weekStart: string; avgDays: number }[];
  slaCompliancePercent: number;
}

export function BilkollenSLASection({ orgId }: { orgId: string }) {
  const [data, setData] = useState<SlaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics/sla?orgId=${orgId}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch SLA data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [orgId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Could not load data.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Genomsnittlig genomloppstid (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.avgProcessingDays7d.toFixed(1)} dagar
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Genomsnittlig genomloppstid (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.avgProcessingDays30d.toFixed(1)} dagar
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Genomloppstid per vecka</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <BilkollenSLAWeeklyChart data={data.weeklyProcessingTime} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>% ärenden avslutade &lt; 7 dagar</CardTitle>
          </CardHeader>
          <CardContent>
            <BilkollenSLAComplianceChart data={{ slaCompliancePercent: data.slaCompliancePercent }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
