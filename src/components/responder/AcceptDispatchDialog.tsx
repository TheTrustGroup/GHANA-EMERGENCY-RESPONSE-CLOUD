'use client';

/**
 * AcceptDispatchDialog Component
 * Dialog for accepting or declining new dispatch assignments
 */

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, MapPin, X, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IncidentMapView } from '@/components/maps/IncidentMapView';
import { ETACalculator } from '@/components/dispatch/ETACalculator';
import { IncidentSeverity } from '@prisma/client';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

interface AcceptDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: string;
  incidentId: string;
  onAccepted?: () => void;
  onDeclined?: () => void;
}

export function AcceptDispatchDialog({
  open,
  onOpenChange,
  dispatchId,
  incidentId,
  onAccepted,
  onDeclined,
}: AcceptDispatchDialogProps) {
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const { toast } = useToast();

  // Fetch dispatch and incident details
  const { data: dispatch } = trpc.dispatch.getByIncident.useQuery(
    { incidentId },
    { enabled: open }
  );

  const { data: incident } = trpc.incidents.getById.useQuery(
    { id: incidentId },
    { enabled: open }
  );

  const currentDispatch = dispatch?.find((d) => d.id === dispatchId);

  // Auto-dismiss after 2 minutes
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      // Mark as no response
      toast({
        title: 'Assignment Timeout',
        description: 'No response received. Assignment will be reassigned.',
        variant: 'destructive',
      });
      onOpenChange(false);
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, [open, onOpenChange, toast]);

  const acceptMutation = trpc.dispatch.accept.useMutation({
    onSuccess: () => {
      toast({
        title: 'Assignment Accepted',
        description: 'You have accepted this assignment.',
      });
      onAccepted?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept assignment',
        variant: 'destructive',
      });
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate({ id: dispatchId });
  };

  const handleDecline = () => {
    if (!declineReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for declining',
        variant: 'destructive',
      });
      return;
    }
    // TODO: Implement decline mutation
    toast({
      title: 'Assignment Declined',
      description: 'Your response has been recorded.',
    });
    onDeclined?.();
    onOpenChange(false);
  };

  if (!currentDispatch || !incident) {
    return null;
  }

  const isCritical = incident.severity === IncidentSeverity.CRITICAL;
  const responderLocation =     (currentDispatch as any).latitude && (currentDispatch as any).longitude
      ? { latitude: (currentDispatch as any).latitude, longitude: (currentDispatch as any).longitude }
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCritical && <AlertTriangle className="h-5 w-5 text-red-600" />}
            New Assignment
            {isCritical && (
              <Badge variant="destructive" className="ml-2">
                URGENT
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Received {formatDistanceToNow(new Date(currentDispatch.dispatchedAt), { addSuffix: true })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Incident Details */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-lg mb-2">{incident.title}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
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
              <Badge variant="outline">{incident.category}</Badge>
              <Badge variant="outline">Priority {currentDispatch.priority}</Badge>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4" />
              <span>{incident.address || `${incident.district}, ${incident.region}`}</span>
            </div>
            {incident.description && (
              <p className="mt-2 text-sm">{incident.description}</p>
            )}
          </div>

          {/* Mini Map */}
          <div className="h-48 rounded-lg border overflow-hidden">
            <IncidentMapView
              latitude={incident.latitude}
              longitude={incident.longitude}
              severity={incident.severity}
              agencies={[]}
              className="h-full w-full"
            />
          </div>

          {/* ETA Calculator */}
          {responderLocation && (
            <ETACalculator
              responderLocation={responderLocation}
              incidentLocation={{
                latitude: incident.latitude,
                longitude: incident.longitude,
              }}
            />
          )}

          {/* Decline Form */}
          {showDeclineForm && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <Label htmlFor="decline-reason" className="text-red-900">
                Reason for Declining (Required)
              </Label>
              <Textarea
                id="decline-reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="mt-2"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!showDeclineForm ? (
            <>
              <Button
                variant="destructive"
                onClick={() => setShowDeclineForm(true)}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {acceptMutation.isPending ? 'Accepting...' : 'Accept Assignment'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeclineForm(false);
                  setDeclineReason('');
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDecline}
                className="w-full sm:w-auto"
              >
                Confirm Decline
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

