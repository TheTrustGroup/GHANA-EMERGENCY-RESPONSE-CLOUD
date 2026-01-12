'use client';

/**
 * ResponderTrackingDialog Component
 * Dialog showing responder's current location and tracking
 */

import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IncidentMapView } from '@/components/maps/IncidentMapView';
import { ETACalculator } from './ETACalculator';
import { DispatchStatusBadge } from './DispatchStatusBadge';
import { trpc } from '@/lib/trpc/client';

interface ResponderTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: string;
  incidentId: string;
}

export function ResponderTrackingDialog({
  open,
  onOpenChange,
  dispatchId,
  incidentId,
}: ResponderTrackingDialogProps) {
  // Fetch dispatch details
  const { data: dispatch } = trpc.dispatch.getByIncident.useQuery(
    { incidentId },
    {
      enabled: open,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Fetch incident details
  const { data: incident } = trpc.incidents.getById.useQuery(
    { id: incidentId },
    { enabled: open, refetchInterval: 30000 }
  );

  const currentDispatch = dispatch?.find((d) => d.id === dispatchId);

  if (!currentDispatch || !incident) {
    return null;
  }

  const responderLocation =
    (currentDispatch as any).latitude && (currentDispatch as any).longitude
      ? {
          latitude: (currentDispatch as any).latitude,
          longitude: (currentDispatch as any).longitude,
        }
      : null;

  const incidentLocation = {
    latitude: incident.latitude,
    longitude: incident.longitude,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Responder Tracking</DialogTitle>
          <DialogDescription>
            Real-time tracking for dispatch assignment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dispatch Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Responder</p>
              <p className="font-medium">{currentDispatch.responder?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <DispatchStatusBadge status={currentDispatch.status as any} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dispatched</p>
              <p className="text-sm">
                {formatDistanceToNow(new Date(currentDispatch.dispatchedAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="h-96 rounded-lg border">
            <IncidentMapView
              latitude={incidentLocation.latitude}
              longitude={incidentLocation.longitude}
              severity={incident.severity}
              agencies={[]}
              responderLocation={
                responderLocation
                  ? ({
                      id: currentDispatch.responderId || '',
                      name: currentDispatch.responder?.name || 'Responder',
                      latitude: responderLocation.latitude,
                      longitude: responderLocation.longitude,
                      status: 'dispatched',
                      incidentId: incidentId,
                    } as any)
                  : undefined
              }
              className="h-full w-full"
            />
          </div>

          {/* ETA Calculator */}
          {responderLocation && (
            <ETACalculator
              responderLocation={responderLocation}
              incidentLocation={incidentLocation}
            />
          )}

          {/* Status Timeline */}
          <div className="space-y-2">
            <h4 className="font-medium">Status Updates</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Dispatched</span>
                <span>{formatDistanceToNow(new Date(currentDispatch.dispatchedAt), { addSuffix: true })}</span>
              </div>
              {currentDispatch.acceptedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accepted</span>
                  <span>{formatDistanceToNow(new Date(currentDispatch.acceptedAt), { addSuffix: true })}</span>
                </div>
              )}
              {currentDispatch.arrivedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Arrived</span>
                  <span>{formatDistanceToNow(new Date(currentDispatch.arrivedAt), { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

