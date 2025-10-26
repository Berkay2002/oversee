'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Car, Archive, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
      <div className="container mx-auto py-10 px-4 md:px-0">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Prepare data for funding source pie chart
  const fundingSourceData = [
    { name: 'Försäkring', value: statistics.byFundingSource.insurance },
    { name: 'Internt', value: statistics.byFundingSource.internal },
    { name: 'Kund', value: statistics.byFundingSource.customer },
  ].filter((item) => item.value > 0);

  // Prepare data for insurance status chart
  const insuranceStatusData = [
    { name: 'Väntande', value: statistics.byInsuranceStatus.pending },
    { name: 'Godkänd', value: statistics.byInsuranceStatus.approved },
    { name: 'Nekad', value: statistics.byInsuranceStatus.rejected },
  ].filter((item) => item.value > 0);

  // Prepare handler stats for table
  const handlerStatsData = statistics.perHandlerStats.map((stat) => ({
    name: stat.handler_name || 'Okänd',
    total: stat.total,
    ongoing: stat.ongoing,
    completed: stat.completed,
    completionRate: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0,
  }));

  return (
    <div className="container mx-auto py-6 px-4 md:py-10 md:px-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Bilkollen Översikt</h1>
            <p className="text-sm text-muted-foreground md:text-base">
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

        {/* Overview metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totalt Ärenden</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalCases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pågående</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.ongoingCases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arkiverade</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.archivedCases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Genomsnittlig tid</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.avgProcessingDays !== null
                  ? `${Math.round(statistics.avgProcessingDays)} dagar`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Funding source pie chart */}
          <Card>
            <CardHeader>
              <CardTitle>Kostnadstyp</CardTitle>
              <CardDescription>Fördelning av finansieringskällor</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fundingSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {fundingSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insurance status chart */}
          <Card>
            <CardHeader>
              <CardTitle>Försäkringsstatus</CardTitle>
              <CardDescription>Status för försäkringsärenden</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insuranceStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cases per week trend */}
        <Card>
          <CardHeader>
            <CardTitle>Ärenden per vecka</CardTitle>
            <CardDescription>Trend för de senaste 12 veckorna</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.casesPerWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Antal ärenden" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Per handler breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Handläggare</CardTitle>
            <CardDescription>Prestanda per handläggare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Namn</th>
                    <th className="text-right py-2 px-4">Totalt</th>
                    <th className="text-right py-2 px-4">Pågående</th>
                    <th className="text-right py-2 px-4">Klara</th>
                    <th className="text-right py-2 px-4">Slutförandegrad</th>
                  </tr>
                </thead>
                <tbody>
                  {handlerStatsData.map((stat, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">{stat.name}</td>
                      <td className="text-right py-2 px-4">{stat.total}</td>
                      <td className="text-right py-2 px-4">{stat.ongoing}</td>
                      <td className="text-right py-2 px-4">{stat.completed}</td>
                      <td className="text-right py-2 px-4">{stat.completionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
