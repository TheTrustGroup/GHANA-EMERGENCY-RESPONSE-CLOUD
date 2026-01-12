'use client';

/**
 * Incident Analytics Page
 * Deep dive into incident analytics
 */

import { useState, useMemo } from 'react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Chart } from '@/components/analytics/Chart';
import { DateRangePicker, type DateRange } from '@/components/analytics/DateRangePicker';
import { trpc } from '@/lib/trpc/client';
import { useSession } from 'next-auth/react';
import { subDays } from 'date-fns';
import { getSeverityColor } from '@/lib/map-utils';
import { IncidentSeverity, IncidentStatus } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function IncidentAnalyticsPage() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const agencyIdForQuery =
    session?.user.role === 'AGENCY_ADMIN' && session.user.agencyId
      ? session.user.agencyId
      : undefined;

  const { data: incidentStats, isLoading } = trpc.analytics.getIncidentStats.useQuery(
    {
      startDate: dateRange.from,
      endDate: dateRange.to,
      ...(agencyIdForQuery ? { agencyId: agencyIdForQuery } : {}),
      ...(severityFilter !== 'all' ? { severity: severityFilter as IncidentSeverity } : {}),
      ...(categoryFilter !== 'all' ? { category: categoryFilter } : {}),
      ...(regionFilter !== 'all' ? { region: regionFilter } : {}),
    },
    { enabled: !!dateRange.from && !!dateRange.to }
  );

  // Prepare chart data
  const incidentsBySeverityData = useMemo(() => {
    return (
      incidentStats?.bySeverity.map((item) => ({
        name: item.severity,
        value: item.count,
        color: getSeverityColor(item.severity as IncidentSeverity),
      })) || []
    );
  }, [incidentStats]);

  const incidentsByCategoryData = useMemo(() => {
    return (
      incidentStats?.byCategory.map((item) => ({
        name: item.category,
        value: item.count,
      })) || []
    );
  }, [incidentStats]);

  const incidentsByStatusData = useMemo(() => {
    return (
      incidentStats?.byStatus.map((item) => ({
        name: item.status,
        value: item.count,
      })) || []
    );
  }, [incidentStats]);

  if (isLoading) {
    return (
      <RootLayout>
        <DashboardShell isLoading={true}>
          <div>Loading incident analytics...</div>
        </DashboardShell>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <DashboardShell
        title="Incident Analytics"
        description="Deep dive into incident data and trends"
      >
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.values(IncidentSeverity).map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Fire">Fire</SelectItem>
                  <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                  <SelectItem value="Accident">Accident</SelectItem>
                  <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                  <SelectItem value="Crime">Crime</SelectItem>
                  <SelectItem value="Infrastructure Failure">Infrastructure Failure</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.values(IncidentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Region</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                  <SelectItem value="Ashanti">Ashanti</SelectItem>
                  <SelectItem value="Western">Western</SelectItem>
                  {/* Add more regions */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Chart
            type="pie"
            data={incidentsBySeverityData}
            config={{
              dataKey: 'value',
              nameKey: 'name',
              colors: incidentsBySeverityData.map((item) => item.color),
            }}
            title="Incidents by Severity"
            height={300}
          />
          <Chart
            type="bar"
            data={incidentsByCategoryData}
            config={{
              dataKey: 'value',
              nameKey: 'name',
            }}
            title="Incidents by Category"
            height={300}
          />
          <Chart
            type="donut"
            data={incidentsByStatusData}
            config={{
              dataKey: 'value',
              nameKey: 'name',
            }}
            title="Incidents by Status"
            height={300}
          />
          <Chart
            type="line"
            data={[]} // Would fetch incidents over time
            config={{
              dataKey: 'count',
              xKey: 'date',
            }}
            title="Incidents Over Time"
            height={300}
          />
        </div>

        {/* Additional Analysis */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Incident Lifecycle Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Advanced analytics including escalation patterns, category correlations, and seasonal trends
              will be displayed here.
            </p>
          </CardContent>
        </Card>
      </DashboardShell>
    </RootLayout>
  );
}

