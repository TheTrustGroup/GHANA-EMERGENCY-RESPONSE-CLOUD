'use client';

/**
 * Agency Analytics Page
 * Single agency detailed analytics
 */

import { useParams } from 'next/navigation';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { MetricCard } from '@/components/analytics/MetricCard';
import { Chart } from '@/components/analytics/Chart';
// import { Leaderboard } from '@/components/analytics/Leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { Clock, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { subDays } from 'date-fns';
import { DateRangePicker, type DateRange } from '@/components/analytics/DateRangePicker';
import { useState } from 'react';

export default function AgencyAnalyticsPage() {
  const params = useParams();
  const agencyId = params.id as string;
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: agency, isLoading: isLoadingAgency } = trpc.agencies.getById.useQuery(
    { id: agencyId },
    { enabled: !!agencyId }
  );

  const { data: performance, isLoading: isLoadingPerformance } =
    trpc.analytics.getAgencyPerformance.useQuery(
      {
        agencyId,
        startDate: dateRange.from,
        endDate: dateRange.to,
      },
      { enabled: !!agencyId && !!dateRange.from && !!dateRange.to }
    );

  // Response time metrics - commented out until used
  // const { data: responseTimeMetrics, isLoading: isLoadingResponseTime } =
  //   trpc.analytics.getResponseTimeMetrics.useQuery(
  //     {
  //       agencyId,
  //       startDate: dateRange.from,
  //       endDate: dateRange.to,
  //     },
  //     { enabled: !!agencyId && !!dateRange.from && !!dateRange.to }
  //   );

  if (isLoadingAgency || isLoadingPerformance) {
    return (
      <RootLayout>
        <DashboardShell isLoading={true}>
          <div>Loading agency analytics...</div>
        </DashboardShell>
      </RootLayout>
    );
  }

  if (!agency) {
    return (
      <RootLayout>
        <DashboardShell>
          <div>Agency not found</div>
        </DashboardShell>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <DashboardShell
        title={`Analytics: ${agency.name}`}
        description="Agency-specific performance metrics"
      >
        <div className="mb-6">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <MetricCard
            label="Total Incidents"
            value={performance?.totalIncidents || 0}
            icon={TrendingUp}
            iconColor="text-blue-600"
          />
          <MetricCard
            label="Avg Response Time"
            value={performance?.avgResponseTime ? `${performance.avgResponseTime} min` : 'N/A'}
            icon={Clock}
            iconColor="text-purple-600"
          />
          <MetricCard
            label="Resolution Rate"
            value={performance?.resolutionRate ? `${performance.resolutionRate}%` : '0%'}
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

        {/* Comparison to System Average */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance vs. System Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Comparison metrics and responder performance will be displayed here.
            </p>
          </CardContent>
        </Card>

        {/* Response Time Trends */}
        <Chart
          type="line"
          data={[]} // Response time trends for this agency
          config={{
            dataKey: 'avgResponseTime',
            xKey: 'date',
          }}
          title="Response Time Trends"
          height={300}
        />
      </DashboardShell>
    </RootLayout>
  );
}

