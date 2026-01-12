'use client';

/**
 * Premium Enterprise Dashboard
 * World-class emergency response platform dashboard
 * Features: Live incidents, real-time map, analytics, alerts feed
 */

import { useMemo } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Activity, 
  MapPin, 
  TrendingUp,
  Users,
  Radio,
  Bell,
  Zap
} from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { StatCard } from '@/components/dashboard/StatCard';
import { LiveIncidentMap } from '@/components/maps/LiveIncidentMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc/client';
import { format, formatDistanceToNow } from 'date-fns';
import { IncidentSeverity } from '@prisma/client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const severityColors: Record<IncidentSeverity, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#991b1b',
};

const severityLabels: Record<IncidentSeverity, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export default function PremiumDashboard() {

  // Fetch active incidents
  const { data: activeIncidents } = trpc.incidents.getActive.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Fetch dashboard stats
  const { data: stats } = trpc.analytics.getDashboardStats.useQuery(
    { dateRange: '24h' },
    { refetchInterval: 30000 }
  );

  // Fetch recent incidents
  const { data: recentIncidents } = trpc.incidents.getAll.useQuery(
    {
      page: 1,
      pageSize: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { refetchInterval: 30000 }
  );

  // Fetch agencies for map
  const { data: agencies } = trpc.agencies.getAll.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Sort incidents by severity and recency
  const sortedIncidents = useMemo(() => {
    if (!activeIncidents) return [];
    
    const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    
    return [...activeIncidents].sort((a, b) => {
      const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activeIncidents]);

  // Get critical incidents count
  const criticalCount = sortedIncidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = sortedIncidents.filter(i => i.severity === 'HIGH').length;

  return (
    <RootLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Command Center</h1>
            <p className="text-slate-600 mt-1">
              Real-time emergency response monitoring and dispatch
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
              <Activity className="h-3 w-3 mr-1.5" />
              System Operational
            </Badge>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/dashboard/map">
                <MapPin className="h-4 w-4 mr-2" />
                Full Map View
              </Link>
            </Button>
          </div>
        </div>

        {/* Top Row: Premium Stat Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Incidents"
            value={activeIncidents?.length || 0}
            icon={AlertTriangle}
            color={activeIncidents && activeIncidents.length > 0 ? 'danger' : 'default'}
            change={stats?.change24h}
            trend={stats?.change24h && stats.change24h > 0 ? 'up' : 'down'}
          />
          <StatCard
            label="Critical Alerts"
            value={criticalCount}
            icon={Zap}
            color={criticalCount > 0 ? 'danger' : 'default'}
            tooltip={`${highCount} high priority incidents`}
          />
          <StatCard
            label="Avg Response Time"
            value={stats?.avgResponseTime ? `${stats.avgResponseTime} min` : 'N/A'}
            icon={Clock}
            color="warning"
          />
          <StatCard
            label="Active Responders"
            value={0}
            icon={Users}
            color="success"
            tooltip="Total responders"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Live Incidents Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Incidents Pane */}
            <Card className="premium-card">
              <CardHeader className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="h-5 w-5 text-blue-600" />
                    Live Incidents
                  </CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {sortedIncidents.length} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {sortedIncidents.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {sortedIncidents.map((incident) => (
                        <Link
                          key={incident.id}
                          href={`/dashboard/incidents/${incident.id}`}
                          className="block p-5 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge
                                  className="text-xs font-semibold px-2 py-1"
                                  style={{
                                    backgroundColor: severityColors[incident.severity],
                                    color: 'white',
                                  }}
                                >
                                  {severityLabels[incident.severity]}
                                </Badge>
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                  {incident.category}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {incident.title}
                              </h3>
                              <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                                {(incident as any).description || 'No description provided'}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {incident.district}, {incident.region}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(incident.createdAt), 'HH:mm')}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  incident.status === 'REPORTED' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                  incident.status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  incident.status === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                  'bg-green-50 text-green-700 border-green-200'
                                )}
                              >
                                {incident.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <Activity className="h-12 w-12 text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">No active incidents</p>
                      <p className="text-sm text-slate-400 mt-1">All systems operational</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Real-time Map Section */}
            {activeIncidents && activeIncidents.length > 0 && (
              <Card className="premium-card">
                <CardHeader className="border-b border-slate-200 pb-4">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Incident Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[400px] rounded-b-xl overflow-hidden">
                    <LiveIncidentMap
                      incidents={activeIncidents.map((inc) => ({
                        id: inc.id,
                        title: inc.title,
                        severity: inc.severity,
                        status: inc.status,
                        category: inc.category,
                        latitude: inc.latitude,
                        longitude: inc.longitude,
                        createdAt: inc.createdAt,
                        district: inc.district,
                        region: inc.region,
                      }))}
                      agencies={agencies || []}
                      showAgencies={true}
                      showResponders={false}
                      className="h-full w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Analytics & Alerts */}
          <div className="space-y-6">
            {/* Analytics Cards */}
            <Card className="premium-card">
              <CardHeader className="border-b border-slate-200 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Response Rate</span>
                    <span className="font-semibold text-slate-900">
                      N/A
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `0%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Resolution Rate</span>
                    <span className="font-semibold text-slate-900">
                      N/A
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                      style={{ width: `0%` }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Today</p>
                      <p className="text-lg font-bold text-slate-900">
                        {stats?.resolvedToday || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">This Week</p>
                      <p className="text-lg font-bold text-slate-900">
                        {stats?.totalActive || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Feed */}
            <Card className="premium-card">
              <CardHeader className="border-b border-slate-200 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {recentIncidents?.incidents && recentIncidents.incidents.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {recentIncidents.incidents.slice(0, 10).map((incident) => (
                        <div key={incident.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div
                              className="h-2 w-2 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: severityColors[incident.severity] }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 mb-1">
                                {incident.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(incident.createdAt), 'MMM d, HH:mm')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <Bell className="h-8 w-8 text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500">No recent alerts</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="premium-card">
              <CardHeader className="border-b border-slate-200 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-2">
                <Button variant="outline" className="w-full justify-start rounded-xl" asChild>
                  <Link href="/dashboard/incidents/new">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Incident
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl" asChild>
                  <Link href="/dashboard/dispatch/active">
                    <Radio className="h-4 w-4 mr-2" />
                    Dispatch Center
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start rounded-xl" asChild>
                  <Link href="/dashboard/analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
