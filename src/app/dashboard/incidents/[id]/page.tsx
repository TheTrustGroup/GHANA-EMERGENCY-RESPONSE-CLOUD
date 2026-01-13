'use client';

/**
 * Incident Detail Page
 * Full incident details with timeline, map, and actions
 */

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  MapPin,
  Calendar,
  User,
  Phone,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IncidentMapView } from '@/components/maps/IncidentMapView';
import { IncidentTimeline } from '@/components/incidents/IncidentTimeline';
import { StatusUpdateDialog } from '@/components/incidents/StatusUpdateDialog';
import { AssignAgencyDialog } from '@/components/incidents/AssignAgencyDialog';
import { AddUpdateDialog } from '@/components/incidents/AddUpdateDialog';
import { trpc } from '@/lib/trpc/client';
import { IncidentStatus, IncidentSeverity } from '@prisma/client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const statusColors: Record<IncidentStatus, string> = {
  REPORTED: 'bg-gray-100 text-gray-800',
  DISPATCHED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-800',
};

const severityColors: Record<IncidentSeverity, string> = {
  LOW: 'bg-severity-low text-white',
  MEDIUM: 'bg-severity-medium text-white',
  HIGH: 'bg-severity-high text-white',
  CRITICAL: 'bg-severity-critical text-white',
};

export default function IncidentDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const incidentId = params.id as string;

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const { data: incident, isLoading, refetch } = trpc.incidents.getById.useQuery(
    { id: incidentId },
    {
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    }
  );

  const { data: updates } = trpc.incidents.getUpdates.useQuery({ id: incidentId });

  const utils = trpc.useUtils();

  const handleStatusUpdate = () => {
    utils.incidents.getById.invalidate({ id: incidentId });
    utils.incidents.getUpdates.invalidate({ id: incidentId });
    refetch();
  };

  if (isLoading) {
    return (
      <RootLayout>
        <DashboardShell isLoading={true}>
          <div>Loading...</div>
        </DashboardShell>
      </RootLayout>
    );
  }

  if (!incident) {
    return (
      <RootLayout>
        <DashboardShell
          error="Incident not found"
          title="Incident Not Found"
          description="The incident you're looking for doesn't exist or you don't have permission to view it."
        >
          <div>Incident not found</div>
        </DashboardShell>
      </RootLayout>
    );
  }

  const userRole = session?.user?.role || 'CITIZEN';
  const canEdit = userRole === 'SYSTEM_ADMIN' || userRole === 'AGENCY_ADMIN' || userRole === 'DISPATCHER';
  const canAssign = userRole === 'DISPATCHER' || userRole === 'AGENCY_ADMIN' || userRole === 'SYSTEM_ADMIN';

  // Build timeline events
  const timelineEvents = [
    {
      id: 'created',
      type: 'created' as const,
      description: 'Incident reported',
      user: (incident as any).reportedBy ? {
        name: (incident as any).reportedBy.name,
        role: 'CITIZEN',
      } : undefined,
      timestamp: incident.createdAt,
    },
    ...(updates || []).map((update: any) => ({
      id: update.id,
      type: (update.updateType === 'NOTE_ADDED' ? 'update' : update.updateType === 'RESPONDER_UPDATE' ? 'responder_assigned' : 'update'),
      description: update.content,
      user: (update as any).user ? {
        name: (update as any).user.name || 'System',
        role: (update as any).user.role || 'SYSTEM_ADMIN',
      } : undefined,
      timestamp: update.createdAt,
      metadata: update.metadata as Record<string, any> | undefined,
    })),
    ...((incident as any).dispatchAssignments || []).map((dispatch: any) => ({
      id: `dispatch-${dispatch.id}`,
      type: 'agency_assigned' as const,
      description: `Assigned to ${dispatch.agency?.name || 'Unknown Agency'}`,
      user: { name: null, role: 'SYSTEM' },
      timestamp: dispatch.dispatchedAt,
    })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Get nearby agencies for map
  const nearbyAgencies = (incident as any).assignedAgency
    ? [(incident as any).assignedAgency]
    : [];

  return (
    <RootLayout>
      <DashboardShell title={`Incident: ${incident.title}`}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{incident.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={cn('text-xs', statusColors[incident.status])}>
                        {incident.status}
                      </Badge>
                      <Badge className={cn('text-xs', severityColors[incident.severity])}>
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline">{incident.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{incident.description}</p>
                {incident.estimatedAffectedPeople && (
                  <div className="mt-4">
                    <span className="text-sm font-medium">Estimated Affected: </span>
                    <span className="text-sm text-muted-foreground">
                      {incident.estimatedAffectedPeople} people
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <IncidentMapView
                  latitude={incident.latitude}
                  longitude={incident.longitude}
                  severity={incident.severity}
                  agencies={nearbyAgencies.map((a) => ({
                    id: a.id,
                    name: a.name,
                    type: a.type,
                    latitude: null,
                    longitude: null,
                  }))}
                />
                <div className="mt-4 space-y-2 text-sm">
                  {incident.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span>{incident.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Region:</span>
                    <span>{incident.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">District:</span>
                    <span>{incident.district}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Coordinates: {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Gallery */}
            {incident.mediaUrls && incident.mediaUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {incident.mediaUrls.map((url, index) => (
                      <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <Image
                            src={url}
                            alt={`Media ${index + 1}`}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <video src={url} className="h-full w-full object-cover" controls />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <IncidentTimeline events={timelineEvents} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setStatusDialogOpen(true)}
                  >
                    Update Status
                  </Button>
                  {canAssign && !(incident as any).assignedAgencyId && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setAssignDialogOpen(true)}
                    >
                      Assign to Agency
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setUpdateDialogOpen(true)}
                  >
                    Add Update
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={`/dashboard/incidents/${incidentId}/messages`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Messages
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Messages Button (always visible) */}
            <Card>
              <CardHeader>
                <CardTitle>Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/dashboard/incidents/${incidentId}/messages`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Reported By
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {(incident as any).reportedBy?.name || incident.reporterName || 'Unknown'}
                  </div>
                  {(incident as any).reportedBy?.email && (
                    <div className="text-xs text-muted-foreground">
                      {(incident as any).reportedBy.email}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Reported At
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {format(new Date(incident.createdAt), 'PPp')}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Last Updated
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {format(new Date(incident.updatedAt), 'PPp')}
                  </div>
                </div>

                {incident.resolvedAt && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        Response Time
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {incident.responseTime ? `${incident.responseTime} minutes` : 'N/A'}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Assigned Agency */}
            {(incident as any).assignedAgency && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Agency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-medium">{(incident as any).assignedAgency.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(incident as any).assignedAgency.type}
                    </div>
                  </div>
                  {(incident as any).assignedAgency.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{(incident as any).assignedAgency.contactPhone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dispatch Assignments */}
            {(incident as any).dispatchAssignments && (incident as any).dispatchAssignments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {((incident as any).dispatchAssignments || []).map((dispatch: any) => (
                    <div key={dispatch.id} className="rounded border p-3">
                      <div className="font-medium">
                        {dispatch.responder?.name || 'Unassigned'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status: {dispatch.status}
                      </div>
                      {dispatch.dispatchNotes && (
                        <div className="mt-2 text-xs text-muted-foreground">{dispatch.dispatchNotes}</div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dialogs */}
        <StatusUpdateDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          incidentId={incidentId}
          currentStatus={incident.status}
          userRole={userRole}
          onSuccess={handleStatusUpdate}
        />

        <AssignAgencyDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          incidentId={incidentId}
          onSuccess={handleStatusUpdate}
        />

        <AddUpdateDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          incidentId={incidentId}
          onSuccess={handleStatusUpdate}
        />
      </DashboardShell>
    </RootLayout>
  );
}

