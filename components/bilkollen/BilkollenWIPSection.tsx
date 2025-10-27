'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { BilkollenWIPLoadChart } from './BilkollenWIPLoadChart';
import { BilkollenAgingBucketsChart } from './BilkollenAgingBucketsChart';

interface WipData {
  totalOpenCases: number;
  casesPerHandler: { handlerUserId: string; handlerName: string; openCount: number }[];
  agingBuckets: { bucket: string; count: number }[];
}

export function BilkollenWIPSection({ orgId }: { orgId: string }) {
  const [data, setData] = useState<WipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics/wip?orgId=${orgId}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch WIP data', error);
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktiva ärenden per handläggare</CardTitle>
          </CardHeader>
          <CardContent>
            <BilkollenWIPLoadChart data={data.casesPerHandler} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Åldersfördelning på ärenden</CardTitle>
          </CardHeader>
          <CardContent>
            <BilkollenAgingBucketsChart data={data.agingBuckets} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
