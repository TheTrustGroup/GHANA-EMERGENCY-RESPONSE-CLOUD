'use client';

/**
 * Responder Assignments Page
 * Mobile-first interface for managing assignments
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, Bell } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AssignmentCard } from '@/components/responder/AssignmentCard';
import { AcceptDispatchDialog } from '@/components/responder/AcceptDispatchDialog';
import { UpdateStatusDialog } from '@/components/responder/UpdateStatusDialog';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { trpc } from '@/lib/trpc/client';
import { calculateDistance } from '@/lib/map-utils';
import { calculateETA, getTimeOfDay } from '@/lib/dispatch-logic';
import { useToast } from '@/hooks/use-toast';
import { IncidentSeverity, DispatchStatus } from '@prisma/client';
import { EmptyState } from '@/components/ui/empty-state';

export default function ResponderAssignmentsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | undefined>();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>();
  const [currentStatus, setCurrentStatus] = useState<any>('accepted');

  // Fetch assignments
  const { data: assignments, refetch } = trpc.dispatch.getMyAssignments.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Get user location for distance/ETA calculations
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Track location for active assignments
  const activeAssignments = assignments?.assignments?.filter((a) =>
    a.status !== DispatchStatus.COMPLETED && a.status !== DispatchStatus.DISPATCHED
  ) || [];
  const activeDispatchId = activeAssignments[0]?.id;

  const { location } = useLocationTracking({
    enabled: activeAssignments.length > 0,
    dispatchId: activeDispatchId,
  });

  useEffect(() => {
    if (location) {
      setUserLocation({ latitude: location.latitude, longitude: location.longitude });
    }
  }, [location]);

  // Check for new pending assignments
  const pendingAssignments = assignments?.assignments?.filter((a) => a.status === DispatchStatus.DISPATCHED) || [];
  const completedAssignments = assignments?.assignments?.filter((a) => a.status === DispatchStatus.COMPLETED) || [];

  // Show accept dialog for new pending assignments
  useEffect(() => {
    if (pendingAssignments.length > 0 && !acceptDialogOpen) {
      const latestPending = pendingAssignments[0];
      setSelectedDispatchId(latestPending.id);
      setSelectedIncidentId(latestPending.incidentId);
      setAcceptDialogOpen(true);
      
      // Show notification
      toast({
        title: 'New Assignment',
        description: latestPending.incident.title,
        duration: 10000,
      });
    }
  }, [pendingAssignments, acceptDialogOpen, toast]);

  const handleGetDirections = (incident: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`;
    window.open(url, '_blank');
  };

  const handleCallDispatch = () => {
    // TODO: Implement call functionality
    toast({
      title: 'Call Dispatch',
      description: 'Calling dispatch center...',
    });
  };

  const handleUpdateStatus = (dispatch: any) => {
    setSelectedDispatchId(dispatch.id);
    setCurrentStatus(dispatch.status);
    setUpdateStatusDialogOpen(true);
  };

  const handleStatusUpdated = () => {
    refetch();
    setUpdateStatusDialogOpen(false);
  };

  return (
    <RootLayout>
      <DashboardShell
        title="My Assignments"
        description="Manage your incident assignments"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active ({activeAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingAssignments.length})
              {pendingAssignments.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingAssignments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAssignments.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Tab */}
          <TabsContent value="active" className="space-y-4">
            {activeAssignments.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No Active Assignments"
                description="You don't have any active assignments at the moment."
              />
            ) : (
              activeAssignments.map((assignment) => {
                const incident = assignment.incident;
                const distance = userLocation
                  ? calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      incident.latitude,
                      incident.longitude
                    )
                  : undefined;
                const eta = userLocation
                  ? calculateETA(
                      userLocation,
                      { latitude: incident.latitude, longitude: incident.longitude },
                      getTimeOfDay()
                    )
                  : undefined;

                return (
                  <AssignmentCard
                    key={assignment.id}
                    id={assignment.id}
                    incidentId={assignment.incidentId}
                    title={incident.title}
                    severity={incident.severity}
                    status={assignment.status as any}
                    address={incident.address}
                    district={assignment.incident.district}
                    region={assignment.incident.region}
                    distance={distance}
                    eta={eta}
                    dispatchedAt={new Date(assignment.dispatchedAt)}
                    acceptedAt={assignment.acceptedAt ? new Date(assignment.acceptedAt) : null}
                    arrivedAt={assignment.arrivedAt ? new Date(assignment.arrivedAt) : null}
                    priority={assignment.priority}
                    onGetDirections={() => handleGetDirections(incident)}
                    onCallDispatch={handleCallDispatch}
                    onUpdateStatus={() => handleUpdateStatus(assignment)}
                  />
                );
              })
            )}
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingAssignments.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No Pending Assignments"
                description="You don't have any pending assignments."
              />
            ) : (
              pendingAssignments.map((assignment) => {
                const incident = assignment.incident;
                const isCritical = incident.severity === IncidentSeverity.CRITICAL;

                return (
                  <Card
                    key={assignment.id}
                    className={isCritical ? 'border-red-500 bg-red-50' : ''}
                  >
                    <div className="p-4">
                      {isCritical && (
                        <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-100 p-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-red-900">URGENT ASSIGNMENT</span>
                        </div>
                      )}
                      <h3 className="font-semibold text-lg">{incident.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          style={{
                            backgroundColor:
                              incident.severity === 'CRITICAL'
                                ? '#991b1b'
                                : incident.severity === 'HIGH'
                                  ? '#ef4444'
                                  : '#f59e0b',
                            color: 'white',
                          }}
                        >
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline">Priority {assignment.priority}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {incident.address || `${incident.district}, ${incident.region}`}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedDispatchId(assignment.id);
                            setSelectedIncidentId(assignment.incidentId);
                            setAcceptDialogOpen(true);
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          asChild
                          className="flex-1"
                        >
                          <a href={`/dashboard/responder/assignment/${assignment.id}`}>
                            View Details
                          </a>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completedAssignments.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No Completed Assignments"
                description="You haven't completed any assignments yet."
              />
            ) : (
              completedAssignments.map((assignment) => {
                const incident = assignment.incident;
                return (
                  <AssignmentCard
                    key={assignment.id}
                    id={assignment.id}
                    incidentId={assignment.incidentId}
                    title={incident.title}
                    severity={incident.severity}
                    status="completed"
                    address={incident.address}
                    district={assignment.incident.district}
                    region={assignment.incident.region}
                    dispatchedAt={new Date(assignment.dispatchedAt)}
                    acceptedAt={assignment.acceptedAt ? new Date(assignment.acceptedAt) : null}
                    arrivedAt={assignment.arrivedAt ? new Date(assignment.arrivedAt) : null}
                    priority={assignment.priority}
                  />
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Accept Dialog */}
        {selectedDispatchId && selectedIncidentId && (
          <AcceptDispatchDialog
            open={acceptDialogOpen}
            onOpenChange={setAcceptDialogOpen}
            dispatchId={selectedDispatchId}
            incidentId={selectedIncidentId}
            onAccepted={() => {
              refetch();
              setAcceptDialogOpen(false);
            }}
            onDeclined={() => {
              refetch();
              setAcceptDialogOpen(false);
            }}
          />
        )}

        {/* Update Status Dialog */}
        {selectedDispatchId && (
          <UpdateStatusDialog
            open={updateStatusDialogOpen}
            onOpenChange={setUpdateStatusDialogOpen}
            dispatchId={selectedDispatchId}
            currentStatus={currentStatus}
            onStatusUpdated={handleStatusUpdated}
          />
        )}
      </DashboardShell>
    </RootLayout>
  );
}

