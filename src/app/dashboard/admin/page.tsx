'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/premium/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/premium/Card';
import { 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Server,
  Shield,
  Zap,
  Users,
  Building2,
  Eye,
  Settings
} from 'lucide-react';

export default function SystemAdminMissionControl() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  
  const { data: systemStats, refetch } = trpc.system.getSystemStats.useQuery({ timeRange });
  const { data: systemHealth } = trpc.system.getHealth.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const criticalCount = systemStats?.critical || 0;
  const incidentChange = systemStats?.incidentChange || 0;

  return (
    <div className="min-h-screen bg-slate-950">
      
      {/* MISSION CONTROL TOP BAR */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* LEFT */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white">
                    SYSTEM CONTROL
                  </h1>
                  <p className="font-mono text-xs text-blue-400">
                    Ghana Emergency Platform • {new Date().toLocaleString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false 
                    })}
                  </p>
                </div>
              </div>
              
              {/* Live stats */}
              <div className="flex items-center gap-3">
                {criticalCount > 0 && (
                  <div className="flex animate-pulse items-center gap-2 rounded-xl border-2 border-red-600 bg-red-600/20 px-4 py-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="text-sm font-black text-red-400">
                      {criticalCount} CRITICAL
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER - System Health */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2">
              <Activity className="h-4 w-4 animate-pulse text-green-400" />
              <span className="font-mono text-xs font-semibold text-green-400">
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={() => refetch()}
              />
              
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white"
                icon={<Settings className="h-4 w-4" />}
              />
              
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                icon={<Download className="h-4 w-4" />}
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CRITICAL ALERTS BANNER */}
      {criticalCount > 0 && (
        <div className="border-b border-red-600/50 bg-gradient-to-r from-red-900/60 via-red-800/60 to-red-900/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="animate-pulse rounded-xl bg-red-600 p-3">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-300">
                    {criticalCount} CRITICAL INCIDENT{criticalCount > 1 ? 'S' : ''} REQUIRE IMMEDIATE ATTENTION
                  </h3>
                  <p className="text-sm text-red-400">
                    System monitoring active • Auto-escalation enabled
                  </p>
                </div>
              </div>
              <Button className="font-bold bg-red-600 hover:bg-red-700">
                VIEW ALL CRITICAL →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="space-y-6 p-6">
        
        {/* ROW 1: KEY METRICS */}
        <div className="grid grid-cols-4 gap-6">
          <SystemMetric
            icon={AlertTriangle}
            label="Active Incidents"
            value={systemStats?.activeIncidents || 0}
            change={incidentChange}
            color="red"
          />
          <SystemMetric
            icon={Zap}
            label="Avg Response"
            value={`${systemStats?.avgResponseTime || 0}m`}
            change={-18}
            color="blue"
          />
          <SystemMetric
            icon={Users}
            label="Active Responders"
            value={systemStats?.activeResponders || 0}
            change={null}
            color="green"
          />
          <SystemMetric
            icon={Building2}
            label="Agencies Online"
            value={`${systemStats?.onlineAgencies || 0}/${systemStats?.totalAgencies || 0}`}
            change={null}
            color="purple"
          />
        </div>

        {/* ROW 2: SYSTEM HEALTH + MAP */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* System Health */}
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="border-b border-slate-800">
              <CardTitle className="flex items-center gap-2 text-white">
                <Server className="h-5 w-5 text-green-400" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <HealthIndicator
                label="API Server"
                status="operational"
                metric={`${systemHealth?.api.responseTime || 0}ms`}
              />
              <HealthIndicator
                label="Database"
                status={systemHealth?.database.status || 'operational'}
                metric={`${systemHealth?.database.queryTime || 0}ms`}
              />
              <HealthIndicator
                label="Real-time"
                status={systemHealth?.realtime.status || 'operational'}
                metric={`${systemHealth?.realtime.connections || 0} conn`}
              />
              <HealthIndicator
                label="Storage"
                status={systemHealth?.storage.status || 'operational'}
                metric={`${systemHealth?.storage.usage || 0}GB`}
              />
              <HealthIndicator
                label="SMS Gateway"
                status={systemHealth?.sms.status || 'degraded'}
                metric={`${systemHealth?.sms.latency || 0}ms`}
                warning={systemHealth?.sms.status === 'degraded' ? 'Elevated latency' : undefined}
              />
            </CardContent>
          </Card>

          {/* Placeholder for map */}
          <div className="col-span-2 flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-center text-slate-600">
              <Eye className="mx-auto mb-4 h-16 w-16 opacity-20" />
              <p className="font-semibold">Live Map View</p>
              <p className="mt-1 text-sm opacity-60">Integrate your map component here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SystemMetric({ icon: Icon, label, value, change, color }: any) {
  const colors: Record<string, string> = {
    red: 'from-red-600 to-red-700',
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
  };

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className={`rounded-xl bg-gradient-to-br ${colors[color]} p-3 shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change !== null && (
            <div className={`text-sm font-semibold ${
              change < 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {change > 0 ? '+' : ''}{change}%
            </div>
          )}
        </div>
        <p className="mb-1 text-sm text-slate-400">{label}</p>
        <p className="text-4xl font-black text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

function HealthIndicator({ label, status, metric, warning }: any) {
  const statusConfig: Record<string, any> = {
    operational: { color: 'text-green-400', bg: 'bg-green-600', icon: CheckCircle2 },
    degraded: { color: 'text-yellow-400', bg: 'bg-yellow-600', icon: AlertTriangle },
    down: { color: 'text-red-400', bg: 'bg-red-600', icon: AlertTriangle },
  };

  const config = statusConfig[status] || statusConfig.operational;
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-3">
      <div className="flex items-center gap-3">
        <div className={`${config.bg} rounded-lg p-2`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          {warning && <p className="text-xs text-yellow-400">⚠️ {warning}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xs font-bold uppercase ${config.color}`}>
          {status}
        </p>
        <p className="font-mono text-xs text-slate-400">{metric}</p>
      </div>
    </div>
  );
}
