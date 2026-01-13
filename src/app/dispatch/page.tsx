'use client';

/**
 * SIMPLE Dispatcher Command Center
 * Split screen: Map (70%) + Incident Feed (30%)
 * Core Philosophy: See all emergencies, assign agency, done
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Clock,
  MapPin,
  Filter,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiveMap } from '@/components/maps/LiveMap';
import { trpc } from '@/lib/trpc/client';
import { IncidentSeverity } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { AssignAgencyDialog } from '@/components/incidents/AssignAgencyDialog';
import { useIncidentUpdates } from '@/lib/realtime/pusher-client';
import { useCallback } from 'react';
import { toast } from 'sonner';

const severityColors: Record<IncidentSeverity, string> = {
  LOW: '#16a34a',
  MEDIUM: '#ca8a04',
  HIGH: '#ea580c',
  CRITICAL: '#dc2626',
};

export default function DispatchCenter() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'unassigned' | 'in-progress'>('unassigned');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Fetch all active incidents
  // Fetch active incidents for map
  const { data: mapIncidents } = trpc.incidents.getActiveForMap.useQuery(
    undefined,
    { refetchInterval: 15000 }
  );

  const { data: incidentsData, refetch, isLoading } = trpc.incidents.getAll.useQuery(
    {
      status: undefined, // Get all statuses
      page: 1,
      pageSize: 100,
      sortBy: 'severity',
      sortOrder: 'desc',
    },
    { refetchInterval: 15000 } // Refresh every 15 seconds
  );

  // Real-time updates
  useIncidentUpdates(useCallback((data: any) => {    refetch();

    if (data.severity === 'CRITICAL') {
      toast.error(`CRITICAL INCIDENT: ${data.title}`, {
        duration: 10000,
      });
    }
  }, [refetch]));

  const incidents = incidentsData?.incidents || [];

  // Filter incidents
  const unassignedIncidents = useMemo(
    () =>
      incidents.filter(
        (i) => i.status === 'REPORTED' && !i.assignedAgencyId
      ),
    [incidents]
  );

  const inProgressIncidents = useMemo(
    () =>
      incidents.filter(
        (i) => i.status === 'DISPATCHED' || i.status === 'IN_PROGRESS'
      ),
    [incidents]
  );

  const displayedIncidents =
    selectedTab === 'unassigned' ? unassignedIncidents : inProgressIncidents;

  const handleIncidentClick = (incident: any) => {
    router.push(`/dashboard/incidents/${incident.id}`);
  };

  const handleAssignClick = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setAssignDialogOpen(true);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-900">
      {/* LEFT: Live Map (70%) */}
      <div className="flex-1 relative">
        {/* Map Component */}
        <div className="absolute inset-0">
          <LiveMap
            incidents={(mapIncidents || incidents.map((inc) => ({
              id: inc.id,
              title: inc.title,
              category: inc.category,
              severity: inc.severity,
              latitude: inc.latitude,
              longitude: inc.longitude,
              status: inc.status,
            })))}
            onIncidentClick={handleIncidentClick}
          />
        </div>

        {/* Map Controls - Top Right */}
        <div className="absolute top-4 right-4 space-y-2 z-10">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white hover:bg-gray-50 shadow-lg"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white hover:bg-gray-50 shadow-lg"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Legend - Bottom Left */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <p className="font-semibold mb-2 text-sm">Incident Severity</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Incident Feed (30%) */}
      <div className="w-[500px] bg-white flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="p-4 border-b bg-slate-900 text-white">
          <h1 className="text-xl font-bold">Active Incidents</h1>
          <p className="text-sm text-slate-300 mt-1">
            {unassignedIncidents.length} pending • {inProgressIncidents.length} in progress
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setSelectedTab('unassigned')}
            className={cn(
              'flex-1 py-3 font-semibold transition-colors',
              selectedTab === 'unassigned'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            Unassigned ({unassignedIncidents.length})
          </button>
          <button
            onClick={() => setSelectedTab('in-progress')}
            className={cn(
              'flex-1 py-3 font-semibold transition-colors',
              selectedTab === 'in-progress'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            In Progress ({inProgressIncidents.length})
          </button>
        </div>

        {/* Incident List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : displayedIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
              <p className="font-semibold text-gray-900">All clear!</p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedTab === 'unassigned'
                  ? 'No unassigned incidents'
                  : 'No incidents in progress'}
              </p>
            </div>
          ) : (
            displayedIncidents.map((incident) => (
              <div
                key={incident.id}
                className={cn(
                  'p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors',
                  incident.severity === 'CRITICAL' && 'bg-red-50/50'
                )}
                onClick={() => handleIncidentClick(incident)}
              >
                <div className="flex items-start gap-3">
                  {/* Severity Indicator */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: severityColors[incident.severity as IncidentSeverity],
                    }}
                  >
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="destructive"
                        className={cn(
                          'text-xs font-bold',
                          incident.severity === 'CRITICAL' && 'animate-pulse'
                        )}
                      >
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {incident.category}
                      </Badge>
                    </div>

                    <p className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {incident.title}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {incident.district}, {incident.region}
                      </span>
                    </div>

                    {/* Photos preview */}
                    {incident.mediaUrls && incident.mediaUrls.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {incident.mediaUrls.slice(0, 3).map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Media ${idx + 1}`}
                            className="w-12 h-12 rounded object-cover border border-gray-200"
                          />
                        ))}
                        {incident.mediaUrls.length > 3 && (
                          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold">
                            +{incident.mediaUrls.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {selectedTab === 'unassigned' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignClick(incident.id);
                    }}
                    className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    Assign Agency →
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assign Agency Dialog */}
      {selectedIncidentId && (
        <AssignAgencyDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          incidentId={selectedIncidentId}
          onSuccess={() => {
            setAssignDialogOpen(false);
            setSelectedIncidentId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
