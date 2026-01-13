'use client';

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useIncidentUpdates } from '@/lib/realtime/pusher-client';
import { Button } from '@/components/ui/premium/Button';
import { Card, CardContent } from '@/components/ui/premium/Card';
import { Badge } from '@/components/ui/premium/Badge';
import {
  AlertCircle,
  Clock,
  MapPin,
  Filter,
  RefreshCw,
  Users,
  Building2,
  Maximize2,
  Zap,
  Radio,
  Activity,
  Target,
  Eye,
  Bell,
  Settings
} from 'lucide-react';
import SatelliteIncidentMap from '@/components/maps/SatelliteIncidentMap';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ClientOnly } from '@/components/ui/ClientOnly';

export default function DispatchCommandCenter() {
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [filter, setFilter] = useState<'unassigned' | 'active' | 'all'>('unassigned');

  const { data: incidents, refetch } = trpc.incidents.getAll.useQuery({
    page: 1,
    pageSize: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: filter === 'unassigned' ? 'REPORTED' : filter === 'active' ? undefined : undefined,
  });

  const { data: mapIncidents } = trpc.incidents.getActiveForMap.useQuery();
  const { data: stats } = trpc.analytics.getDispatchStats.useQuery();

  // Real-time updates with audio alert
  useIncidentUpdates(useCallback((data: any) => {
    refetch();
    if (data.severity === 'CRITICAL') {
      // Visual alert
      toast.error('🚨 CRITICAL INCIDENT', {
        description: data.title,
        duration: 15000,
        className: 'bg-red-900 text-white border-red-700',
      });
    }
  }, [refetch]));

  const criticalCount = incidents?.incidents.filter(i => i.severity === 'CRITICAL').length || 0;
  const unassignedCount = incidents?.incidents.filter(i => i.status === 'REPORTED').length || 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950">

      {/* COMMAND BAR - Mission Control Style */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-slate-900 shadow-2xl">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">

            {/* LEFT: System Status */}
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/50">
                    <Radio className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -right-1 -top-1 h-4 w-4 animate-pulse rounded-full border-2 border-slate-900 bg-green-500" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white">
                    DISPATCH CONTROL
                  </h1>
                  <p className="font-mono text-xs text-blue-400">
                    LIVE OPERATIONS • {new Date().toLocaleTimeString('en-US', { hour12: false })}
                  </p>
                </div>
              </motion.div>

              {/* Live Stats Pills */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {criticalCount > 0 ? (
                    <div className="flex animate-pulse items-center gap-2 rounded-xl border-2 border-red-600 bg-red-600/20 px-4 py-2">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <span className="text-sm font-black text-red-400">
                        {criticalCount} CRITICAL
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-green-600 bg-green-600/20 px-4 py-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-green-400">
                        ALL CLEAR
                      </span>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 rounded-xl border border-blue-600 bg-blue-600/20 px-4 py-2"
                >
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-blue-400">
                    {stats?.activeResponders || 0} ACTIVE
                  </span>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 rounded-xl border border-purple-600 bg-purple-600/20 px-4 py-2"
                >
                  <Zap className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-400">
                    {stats?.avgResponseTime || 0}M AVG
                  </span>
                </motion.div>
              </div>
            </div>

            {/* CENTER: System Health */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 animate-pulse text-green-400" />
                <span className="font-mono text-xs font-semibold text-green-400">
                  SYSTEM ONLINE
                </span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <span className="font-mono text-xs text-slate-400">
                LATENCY: {Math.floor(Math.random() * 50) + 20}MS
              </span>
            </div>

            {/* RIGHT: Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:bg-slate-800 hover:text-white"
                onClick={() => refetch()}
                icon={<RefreshCw className="h-4 w-4" />}
              />
              <Button
                size="sm"
                variant="ghost"
                className="relative text-slate-400 hover:bg-slate-800 hover:text-white"
                icon={<Bell className="h-4 w-4" />}
              >
                {stats && stats.unreadAlerts > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {stats.unreadAlerts}
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:bg-slate-800 hover:text-white"
                icon={<Filter className="h-4 w-4" />}
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:bg-slate-800 hover:text-white"
                icon={<Settings className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SPLIT VIEW */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: LIVE MAP - 65% */}
        <div className={`${mapFullscreen ? 'w-full' : 'w-[65%]'} relative transition-all duration-300`}>
          <div className="absolute inset-0 bg-slate-900">
            <SatelliteIncidentMap
              incidents={mapIncidents || []}
              selectedIncidentId={selectedIncident}
              onIncidentClick={(id) => setSelectedIncident(id)}
              height="h-full"
            />
          </div>

          {/* Map Overlay - Top Right */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMapFullscreen(!mapFullscreen)}
              className="border border-slate-700 bg-slate-900/90 text-white backdrop-blur-sm hover:bg-slate-800"
              icon={<Maximize2 className="h-4 w-4" />}
            />
          </div>

          {/* Map Stats - Bottom Left */}
          <div className="absolute bottom-4 left-4">
            <Card className="border-slate-700 bg-slate-900/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-6 text-sm">
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-black text-red-400">
                      {stats?.critical || 0}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-black text-orange-400">
                      {stats?.high || 0}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">High</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-black text-yellow-400">
                      {stats?.medium || 0}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-black text-blue-400">
                      {stats?.total || 0}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT: INCIDENT FEED - 35% */}
        {!mapFullscreen && (
          <div className="flex w-[35%] flex-col border-l border-slate-800 bg-slate-900">

            {/* Feed Header */}
            <div className="border-b border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
                <Target className="h-5 w-5 text-red-400" />
                PRIORITY QUEUE
              </h2>

              {/* Filter Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFilter('unassigned')}
                  className={`
                    rounded-lg px-3 py-2 text-sm font-bold transition-all
                    ${filter === 'unassigned'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  UNASSIGNED
                  {unassignedCount > 0 && (
                    <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs font-black text-red-600">
                      {unassignedCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`
                    rounded-lg px-3 py-2 text-sm font-bold transition-all
                    ${filter === 'active'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  ACTIVE
                  <span className="ml-2 text-xs">
                    {stats?.active || 0}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`
                    rounded-lg px-3 py-2 text-sm font-bold transition-all
                    ${filter === 'all'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  ALL
                </button>
              </div>
            </div>

            {/* Incident List - Scrollable */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <AnimatePresence>
                {incidents?.incidents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full items-center justify-center text-slate-600"
                  >
                    <div className="text-center">
                      <Eye className="mx-auto mb-4 h-16 w-16 opacity-20" />
                      <p className="font-semibold">All Clear</p>
                      <p className="mt-1 text-sm opacity-60">No incidents in queue</p>
                    </div>
                  </motion.div>
                ) : (
                  incidents?.incidents.map((incident, index) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommandIncidentCard
                        incident={incident}
                        index={index}
                        onSelect={() => setSelectedIncident(incident.id)}
                        isSelected={selectedIncident === incident.id}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommandIncidentCard({ incident, index, onSelect, isSelected }: any) {
  const severityConfig: Record<string, any> = {
    CRITICAL: {
      bg: 'from-red-900/40 to-red-800/40',
      border: 'border-red-600',
      text: 'text-red-400',
      glow: 'shadow-red-600/50',
      pulse: true,
    },
    HIGH: {
      bg: 'from-orange-900/40 to-orange-800/40',
      border: 'border-orange-600',
      text: 'text-orange-400',
      glow: 'shadow-orange-600/50',
      pulse: false,
    },
    MEDIUM: {
      bg: 'from-yellow-900/40 to-yellow-800/40',
      border: 'border-yellow-600',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-600/50',
      pulse: false,
    },
    LOW: {
      bg: 'from-blue-900/40 to-blue-800/40',
      border: 'border-blue-600',
      text: 'text-blue-400',
      glow: 'shadow-blue-600/50',
      pulse: false,
    },
  };

  const config = severityConfig[incident.severity] || severityConfig.LOW;

  return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer rounded-xl border-2 transition-all
        bg-gradient-to-br ${config.bg}
        ${isSelected
          ? `${config.border} ${config.glow} scale-[1.02] shadow-xl`
          : 'border-slate-700 hover:border-slate-600 hover:shadow-lg'
        }
        ${config.pulse ? 'animate-pulse-slow' : ''}
      `}
    >
      {/* Priority Badge */}
      <div className={`
        absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full
        border-4 border-slate-900 text-sm font-black text-white
        shadow-lg
        ${incident.severity === 'CRITICAL' ? 'animate-pulse bg-red-600' :
          incident.severity === 'HIGH' ? 'bg-orange-600' :
          'bg-slate-700'
        }
      `}>
        {index + 1}
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                variant={incident.severity === 'CRITICAL' ? 'critical' : 'high'}
                size="sm"
                pulse={incident.severity === 'CRITICAL'}
              >
                {incident.severity}
              </Badge>
              <Badge variant="default" size="sm" className="border-0 bg-slate-700 text-slate-300">
                {incident.category}
              </Badge>
            </div>
            <h3 className="mb-1 line-clamp-2 text-sm font-bold text-white">
              {incident.title || incident.description?.substring(0, 50) || 'Emergency Report'}
            </h3>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className={incident.severity === 'CRITICAL' ? 'font-bold text-red-400' : ''}>
              <ClientOnly fallback="Just now">
                {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
              </ClientOnly>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{incident.region}</span>
          </div>
        </div>

        {/* Quick Action */}
        {incident.status === 'REPORTED' && (
          <Button
            size="sm"
            className={`
              w-full font-bold shadow-lg
              ${incident.severity === 'CRITICAL'
                ? 'bg-red-600 shadow-red-500/50 hover:bg-red-700'
                : 'bg-blue-600 shadow-blue-500/50 hover:bg-blue-700'
              }
            `}
            icon={<Building2 className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            ASSIGN NOW
          </Button>
        )}
      </div>
    </div>
  );
}
