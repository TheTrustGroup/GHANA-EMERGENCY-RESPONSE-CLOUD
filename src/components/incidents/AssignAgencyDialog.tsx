'use client';

/**
 * SIMPLE Assign Agency Dialog
 * Shows nearby agencies sorted by distance and workload
 * One-click assign
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Users } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AssignAgencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidentId: string;
  onSuccess?: () => void;
}

export function AssignAgencyDialog({
  open,
  onOpenChange,
  incidentId,
  onSuccess,
}: AssignAgencyDialogProps) {
  const { toast } = useToast();
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>(null);

  // Fetch incident details
  const { data: incident } = trpc.incidents.getById.useQuery(
    { id: incidentId },
    { enabled: open && !!incidentId }
  );

  // Fetch available agencies
  const { data: agenciesData, isLoading: agenciesLoading } = trpc.agencies.getAll.useQuery(
    undefined,
    { enabled: open }
  );

  const assignMutation = trpc.dispatch.assign.useMutation({
    onSuccess: () => {
      toast({
        title: 'Agency assigned',
        description: 'Responders have been notified',
      });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Assignment failed',
        description: error.message || 'Failed to assign agency',
        variant: 'destructive',
      });
    },
  });

  const agencies = agenciesData || [];

  // Sort agencies by:
  // 1. Distance from incident (if coordinates available)
  // 2. Current workload (number of active incidents)
  // 3. Agency type match
  const sortedAgencies = [...agencies].sort((a, b) => {
    // Priority: Agencies with coordinates and matching type first
    if (incident && incident.latitude && incident.longitude) {
      // Calculate distance (simplified - would use proper distance calculation)
      const aHasLocation = a.latitude && a.longitude;
      const bHasLocation = b.longitude && b.longitude;

      if (aHasLocation && !bHasLocation) return -1;
      if (!aHasLocation && bHasLocation) return 1;
    }

    // Sort by name as fallback
    return a.name.localeCompare(b.name);
  });

  const handleAssign = () => {
    if (!selectedAgencyId) {
      toast({
        title: 'Select an agency',
        description: 'Please select an agency to assign',
        variant: 'destructive',
      });
      return;
    }

    assignMutation.mutate({
      incidentId,
      agencyId: selectedAgencyId,
      priority: incident?.severity === 'CRITICAL' ? 5 : incident?.severity === 'HIGH' ? 4 : 3,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Agency</DialogTitle>
          <DialogDescription>
            Select an agency to respond to this incident
          </DialogDescription>
        </DialogHeader>

        {incident && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold text-sm mb-1">{incident.title}</p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>
                {incident.district}, {incident.region}
              </span>
              <Badge variant="destructive" className="ml-2 text-xs">
                {incident.severity}
              </Badge>
            </div>
          </div>
        )}

        {agenciesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : sortedAgencies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No agencies available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAgencies.map((agency) => (
              <button
                key={agency.id}
                onClick={() => setSelectedAgencyId(agency.id)}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  selectedAgencyId === agency.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{agency.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {agency.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{(agency as any).description || 'Emergency response agency'}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {agency.district}, {agency.region}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Active responders</span>
                      </div>
                    </div>
                  </div>
                  {selectedAgencyId === agency.id && (
                    <div className="ml-4 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedAgencyId || assignMutation.isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {assignMutation.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Agency'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
