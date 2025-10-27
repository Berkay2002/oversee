'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { BilkollenFundingMixPie } from './BilkollenFundingMixPie';
import { BilkollenFundingDurationBar } from './BilkollenFundingDurationBar';
import { BilkollenInsuranceStatusFunnel } from './BilkollenInsuranceStatusFunnel';

interface InsuranceData {
  byFundingSource: { fundingSource: 'insurance' | 'internal' | 'customer'; count: number; avgProcessingDays: number }[];
  insuranceStatusCounts: { status: 'pending' | 'approved' | 'rejected'; count: number }[];
  pendingOverThresholdCount: number;
}

export function BilkollenInsuranceSection({ orgId }: { orgId: string }) {
  const [data, setData] = useState<InsuranceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics/insurance?orgId=${orgId}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch insurance data', error);
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
              Försäkring väntar &lt; 3 dagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingOverThresholdCount}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Andel ärenden per betaltyp</CardTitle>
          </CardHeader>
          <CardContent>
            <BilkollenFundingMixPie data={data.byFundingSource} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Genomsnittlig genomloppstid per betaltyp</CardTitle>
          </CardHeader>
          <CardContent>
            <BilkollenFundingDurationBar data={data.byFundingSource} />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Försäkringsstatus</CardTitle>
          </CardHeader>
          <CardContent>
            <BilkollenInsuranceStatusFunnel data={data.insuranceStatusCounts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
