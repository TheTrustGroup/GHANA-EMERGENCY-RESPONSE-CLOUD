'use client';

/**
 * Analytics Dashboard
 * Comprehensive analytics view for system and agency admins
 */

import { useState, useMemo } from 'react';
import { FileText, FileSpreadsheet, File } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/analytics/MetricCard';
import { Chart } from '@/components/analytics/Chart';
import { HeatMap } from '@/components/analytics/HeatMap';
import { DateRangePicker, type DateRange } from '@/components/analytics/DateRangePicker';
import { Leaderboard } from '@/components/analytics/Leaderboard';
import { trpc } from '@/lib/trpc/client';
import { useSession } from 'next-auth/react';
import { AlertTriangle, Clock, CheckCircle, Users } from 'lucide-react';
import { subDays } from 'date-fns';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exports';
import { getSeverityColor } from '@/lib/map-utils';
import { IncidentSeverity } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RealTimeIndicator } from '@/components/analytics/RealTimeIndicator';

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [compareToPrevious, setCompareToPrevious] = useState(false);

  // Fetch analytics data
  const { data: dashboardStats, isLoading: isLoadingStats } = trpc.analytics.getDashboardStats.useQuery(
    {
      ...(session?.user.role === 'AGENCY_ADMIN' && session.user.agencyId
        ? { agencyId: session.user.agencyId }
        : {}),
      dateRange: '30d',
    },
    { refetchInterval: 30000 }
  );

  const { data: incidentStats, isLoading: isLoadingIncidents } = trpc.analytics.getIncidentStats.useQuery(
    {
      startDate: dateRange.from,
      endDate: dateRange.to,
      agencyId: session?.user.role === 'AGENCY_ADMIN' ? (session.user.agencyId || undefined) : undefined,
    },
    { enabled: !!dateRange.from && !!dateRange.to }
  );

  const { data: responseTimeMetrics, isLoading: isLoadingResponseTime } =
    trpc.analytics.getResponseTimeMetrics.useQuery(
      {
        startDate: dateRange.from,
        endDate: dateRange.to,
        agencyId: session?.user.role === 'AGENCY_ADMIN' && session.user.agencyId ? session.user.agencyId : undefined,
      },
      { enabled: !!dateRange.from && !!dateRange.to }
    );

  const { data: geographicData } =
    trpc.analytics.getGeographicDistribution.useQuery(undefined, {
      refetchInterval: 60000,
    });

  const { data: topAgencies } = trpc.analytics.getTopAgencies.useQuery(
    {
      limit: 10,
      dateRange: '30d',
    },
    { enabled: session?.user.role === 'SYSTEM_ADMIN' }
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

  const responseTimeByAgencyData = useMemo(() => {
    return (
      responseTimeMetrics?.byAgency
        .map((agency) => ({
          name: agency.agencyName,
          value: agency.avgResponseTime || 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10) || []
    );
  }, [responseTimeMetrics]);

  const heatmapPoints = useMemo(() => {
    // This would come from a more detailed endpoint
    // For now, return empty array
    return [];
  }, []);

  const handleExport = async (exportFormat: 'pdf' | 'excel' | 'csv') => {
    const exportData = [
      { Metric: 'Total Incidents', Value: dashboardStats?.totalActive || 0 },
      { Metric: 'Critical Incidents', Value: dashboardStats?.criticalCount || 0 },
      { Metric: 'Avg Response Time', Value: dashboardStats?.avgResponseTime || 0 },
      { Metric: 'Total Agencies', Value: dashboardStats?.totalAgencies || 0 },
    ];

    try {
      const dateStr = new Date().toISOString().split('T')[0];
      switch (exportFormat) {
        case 'csv':
          exportToCSV(exportData, `analytics_${dateStr}.csv`);
          break;
        case 'excel':
          await exportToExcel(exportData, `analytics_${dateStr}.xlsx`);
          break;
        case 'pdf':
          await exportToPDF(exportData, 'Analytics Report', `analytics_${dateStr}.pdf`);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoadingStats || isLoadingIncidents || isLoadingResponseTime) {
    return (
      <RootLayout>
        <DashboardShell isLoading={true}>
          <div>Loading analytics...</div>
        </DashboardShell>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <DashboardShell
        title="Analytics Dashboard"
        description="Comprehensive analytics and insights"
        actions={
          <div className="flex items-center gap-3">
            <RealTimeIndicator
              isLive={true}
              lastUpdate={new Date()}
              updateInterval={30000}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <File className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        }
      >
        {/* Date Range Picker */}
        <div className="mb-6">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            compareToPrevious={compareToPrevious}
            onCompareToggle={setCompareToPrevious}
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="response">Response Metrics</TabsTrigger>
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
            <TabsTrigger value="temporal">Temporal Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total Incidents"
                value={dashboardStats?.totalActive || 0}
                change={dashboardStats?.change24h}
                trend={dashboardStats?.change24h && dashboardStats.change24h > 0 ? 'up' : 'down'}
                icon={AlertTriangle}
                iconColor="text-blue-600"
                comparison="vs. 24h ago"
              />
              <MetricCard
                label="Avg Response Time"
                value={dashboardStats?.avgResponseTime ? `${dashboardStats.avgResponseTime} min` : 'N/A'}
                icon={Clock}
                iconColor="text-purple-600"
              />
              <MetricCard
                label="Resolution Rate"
                value="85%" // Would calculate from data
                icon={CheckCircle}
                iconColor="text-green-600"
              />
              <MetricCard
                label="Active Responders"
                value={0} // Would fetch from data
                icon={Users}
                iconColor="text-orange-600"
              />
            </div>

            {/* Incident Analysis Charts */}
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
              <HeatMap
                title="Incident Heatmap"
                description="Geographic distribution of incidents"
                points={heatmapPoints}
                height={300}
              />
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </TabsContent>

          <TabsContent value="response" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Chart
                type="bar"
                data={responseTimeByAgencyData}
                config={{
                  dataKey: 'value',
                  nameKey: 'name',
                }}
                title="Response Time by Agency"
                height={300}
              />
              <Chart
                type="line"
                data={[]} // Response time trends
                config={{
                  dataKey: 'avgResponseTime',
                  xKey: 'date',
                }}
                title="Response Time Trends"
                height={300}
              />
            </div>
          </TabsContent>

          <TabsContent value="agencies" className="space-y-6">
            {session?.user.role === 'SYSTEM_ADMIN' && topAgencies && Array.isArray(topAgencies) && topAgencies.length > 0 && (
              <Leaderboard
                title="Top Performing Agencies"
                description="Agencies ranked by performance metrics"
                data={topAgencies.map((agency, index) => ({
                  id: agency.id,
                  rank: index + 1,
                  agency: agency.name,
                  incidentsHandled: agency.incidentCount,
                  avgResponseTime: agency.avgResponseTime ? `${agency.avgResponseTime} min` : 'N/A',
                  resolutionRate: '85%', // Would calculate
                  score: 92, // Would calculate
                }))}
                columns={[
                  { key: 'agency', label: 'Agency' },
                  { key: 'incidentsHandled', label: 'Incidents Handled' },
                  { key: 'avgResponseTime', label: 'Avg Response Time' },
                  { key: 'resolutionRate', label: 'Resolution Rate' },
                  { key: 'score', label: 'Score' },
                ]}
                rankBy="score"
                highlightTop={3}
                onExport={() => {
                  if (topAgencies) {
                    exportToCSV(
                      topAgencies.map((a) => ({
                        Agency: a.name,
                        'Incidents Handled': a.incidentCount,
                        'Avg Response Time': a.avgResponseTime || 'N/A',
                      })),
                      'top_agencies.csv'
                    );
                  }
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Chart
                type="bar"
                data={geographicData?.byRegion.map((item) => ({
                  name: item.region,
                  value: item.count,
                })) || []}
                config={{
                  dataKey: 'value',
                  nameKey: 'name',
                }}
                title="Incidents by Region"
                height={400}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Incidents by District</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Region</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {geographicData?.byDistrict.slice(0, 10).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.region}</TableCell>
                          <TableCell>{item.district}</TableCell>
                          <TableCell>{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            <HeatMap
              title="Incident Density Heatmap"
              description="Geographic heatmap showing incident density"
              points={heatmapPoints}
              height={500}
            />
          </TabsContent>

          <TabsContent value="temporal" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Chart
                type="line"
                data={[]} // Incidents by time of day
                config={{
                  dataKey: 'count',
                  xKey: 'hour',
                }}
                title="Incidents by Time of Day"
                height={300}
              />
              <Chart
                type="bar"
                data={[]} // Incidents by day of week
                config={{
                  dataKey: 'count',
                  nameKey: 'day',
                }}
                title="Incidents by Day of Week"
                height={300}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </RootLayout>
  );
}

