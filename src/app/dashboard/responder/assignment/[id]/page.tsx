'use client';

/**
 * Single Assignment Detail Page
 * Full details page for a single assignment
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { MapPin, Phone, MessageSquare, Camera, AlertTriangle, Navigation } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IncidentMapView } from '@/components/maps/IncidentMapView';
import { UpdateStatusDialog } from '@/components/responder/UpdateStatusDialog';
import { ETACalculator } from '@/components/dispatch/ETACalculator';
import { DispatchStatusBadge } from '@/components/dispatch/DispatchStatusBadge';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { trpc } from '@/lib/trpc/client';
import { calculateDistance } from '@/lib/map-utils';
import { calculateETA, getTimeOfDay } from '@/lib/dispatch-logic';
import { IncidentSeverity, DispatchStatus } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const dispatchId = params.id as string;
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);

  // Fetch my assignments to find this one
  const { data: assignments } = trpc.dispatch.getMyAssignments.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const currentAssignment = assignments?.assignments?.find((a) => a.id === dispatchId) || assignments?.active;

  // Location tracking - must be called unconditionally
  const shouldTrack = currentAssignment
    ? currentAssignment.status !== DispatchStatus.COMPLETED && currentAssignment.status !== DispatchStatus.ARRIVED
    : false;

  const { location } = useLocationTracking({
    enabled: shouldTrack,
    dispatchId: dispatchId,
  });

  if (!currentAssignment) {
    return (
      <RootLayout>
        <DashboardShell isLoading={true}>
          <div>Loading...</div>
        </DashboardShell>
      </RootLayout>
    );
  }

  const incident = currentAssignment.incidents;

  const userLocation = location
    ? { latitude: location.latitude, longitude: location.longitude }
    : null;

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        incident.latitude,
        incident.longitude
      )
    : null;

  const eta = userLocation
    ? calculateETA(
        userLocation,
        { latitude: incident.latitude, longitude: incident.longitude },
        getTimeOfDay()
      )
    : null;

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`;
    window.open(url, '_blank');
  };

  const handleCallDispatch = () => {
    toast({
      title: 'Call Dispatch',
      description: 'Calling dispatch center...',
    });
  };

  const handleSOS = () => {
    // TODO: Implement SOS functionality
    toast({
      title: 'SOS Alert',
      description: 'Emergency backup requested',
      variant: 'destructive',
    });
  };

  const getNextStatus = () => {
    switch (currentAssignment.status) {
      case DispatchStatus.ACCEPTED:
        return DispatchStatus.EN_ROUTE;
      case DispatchStatus.EN_ROUTE:
        return DispatchStatus.ARRIVED;
      case DispatchStatus.ARRIVED:
        return DispatchStatus.COMPLETED;
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <RootLayout>
      <DashboardShell title={incident.title} description={`Assignment #${dispatchId.slice(0, 8)}`}>
        <div className="space-y-4">
          {/* Header */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor:
                          incident.severity === 'CRITICAL'
                            ? '#991b1b'
                            : incident.severity === 'HIGH'
                              ? '#ef4444'
                              : incident.severity === 'MEDIUM'
                                ? '#f59e0b'
                                : '#10b981',
                        color: 'white',
                      }}
                    >
                      {incident.severity}
                    </Badge>
                    <DispatchStatusBadge
                      status={
                        currentAssignment.status as
                          | 'dispatched'
                          | 'accepted'
                          | 'en_route'
                          | 'arrived'
                          | 'completed'
                      }
                    />
                    <Badge variant="outline">Priority {currentAssignment.priority}</Badge>
                  </div>
                  <h1 className="text-2xl font-bold">{incident.title}</h1>
                </div>
                {incident.severity === IncidentSeverity.CRITICAL && (
                  <Button variant="destructive" onClick={handleSOS}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    SOS
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map Section */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span>{incident.address || `${incident.district}, ${incident.region}`}</span>
                </div>
                {distance !== null && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Distance: {distance.toFixed(1)} km</span>
                    {eta && <span>ETA: ~{eta} minutes</span>}
                  </div>
                )}
              </div>
              <div className="h-96 overflow-hidden rounded-lg border">
                <IncidentMapView
                  latitude={incident.latitude}
                  longitude={incident.longitude}
                  severity={incident.severity}
                  agencies={[]}
                  responderLocation={
                    userLocation
                      ? {
                          id: currentAssignment.responderId || '',
                          name: 'You',
                          latitude: userLocation.latitude,
                          longitude: userLocation.longitude,
                        }
                      : undefined
                  }
                  className="h-full w-full"
                />
              </div>
              {userLocation && (
                <div className="mt-4">
                  <ETACalculator
                    responderLocation={userLocation}
                    incidentLocation={{
                      latitude: incident.latitude,
                      longitude: incident.longitude,
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incident Details */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-1 font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {incident.description || 'No description provided'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 font-medium">Category</h4>
                  <Badge variant="outline">{incident.category}</Badge>
                </div>
                <div>
                  <h4 className="mb-1 font-medium">Reported</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(incident.createdAt), 'PPp')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Dispatched {format(new Date(currentAssignment.dispatchedAt), 'PPp')}</span>
                </div>
                {currentAssignment.acceptedAt && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Accepted {format(new Date(currentAssignment.acceptedAt), 'PPp')}</span>
                  </div>
                )}
                {currentAssignment.arrivedAt && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Arrived {format(new Date(currentAssignment.arrivedAt), 'PPp')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleGetDirections} className="w-full">
                  <Navigation className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
                <Button variant="outline" onClick={handleCallDispatch} className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Dispatch
                </Button>
                {nextStatus && (
                  <Button
                    onClick={() => setUpdateStatusDialogOpen(true)}
                    className="col-span-2 w-full"
                  >
                    Update Status to {nextStatus.replace('_', ' ').toUpperCase()}
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
                <Button variant="outline" className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Update Status Dialog */}
        <UpdateStatusDialog
          open={updateStatusDialogOpen}
          onOpenChange={setUpdateStatusDialogOpen}
          dispatchId={dispatchId}
          currentStatus={
            currentAssignment.status as
              | 'dispatched'
              | 'accepted'
              | 'en_route'
              | 'arrived'
              | 'completed'
          }
          onStatusUpdated={() => {
            router.refresh();
          }}
        />
      </DashboardShell>
    </RootLayout>
  );
}
