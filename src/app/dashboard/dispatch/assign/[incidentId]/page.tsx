'use client';

/**
 * Dispatch Assignment Wizard
 * Assign incidents to agencies and responders
 */

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LiveIncidentMap } from '@/components/maps/LiveIncidentMap';
import { AgencyRecommendations } from '@/components/dispatch/AgencyRecommendations';
import { ResponderSelector } from '@/components/dispatch/ResponderSelector';
import { ETACalculator } from '@/components/dispatch/ETACalculator';
import { trpc } from '@/lib/trpc/client';
import { validateDispatchAssignment } from '@/lib/dispatch-logic';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DispatchAssignPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const incidentId = params.incidentId as string;

  const [selectedAgencyId, setSelectedAgencyId] = useState<string | undefined>();
  const [selectedResponderIds, setSelectedResponderIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<number>(3);
  const [notes, setNotes] = useState('');

  // Fetch incident
  const { data: incident, isLoading: incidentLoading } = trpc.incidents.getById.useQuery(
    { id: incidentId },
    { refetchInterval: 30000 }
  );

  // Fetch agencies
  const { data: agencies } = trpc.agencies.getAll.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Fetch responders for selected agency
  const { data: responders } = trpc.dispatch.getRespondersByAgency.useQuery(
    { agencyId: selectedAgencyId || '' },
    { enabled: !!selectedAgencyId, refetchInterval: 30000 }
  );

  // Create dispatch mutation
  const utils = trpc.useUtils();
  const createDispatch = trpc.dispatch.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Dispatch created',
        description: 'Incident has been successfully dispatched.',
      });
      utils.incidents.getById.invalidate({ id: incidentId });
      utils.dispatch.getAllActive.invalidate();
      router.push('/dashboard/dispatch/active');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create dispatch',
        variant: 'destructive',
      });
    },
  });

  // Get selected agency (for validation)
  // const selectedAgency = agencies?.find((a) => a.id === selectedAgencyId);

  // Get selected responder location (for ETA)
  const selectedResponder = responders?.find((r) => selectedResponderIds.includes(r.id));
  const responderLocation =
    selectedResponder && selectedResponder.latitude !== null && selectedResponder.longitude !== null
      ? {
          latitude: selectedResponder.latitude,
          longitude: selectedResponder.longitude,
        }
      : null;

  // Prepare agencies with stats
  const agenciesWithStats = useMemo(() => {
    if (!agencies || !incident) return [];

    return agencies.map((agency) => {
      // Would need to fetch these stats - simplified for now
      return {
        ...agency,
        activeIncidentsCount: 0,
        availableRespondersCount: 0,
        avgResponseTime: null,
      };
    });
  }, [agencies, incident]);

  const handleDispatch = () => {
    if (!incident || !selectedAgencyId) {
      toast({
        title: 'Error',
        description: 'Please select an agency',
        variant: 'destructive',
      });
      return;
    }

    // Validate
    const validation = validateDispatchAssignment(
      {
        incidentId,
        agencyId: selectedAgencyId,
        responderId: selectedResponderIds[0],
        priority,
        notes: notes || undefined,
      },
      { status: incident.status },
      { isActive: true }, // Agencies from getAll are already filtered to active
      selectedResponder
        ? {
            id: selectedResponder.id,
            name: selectedResponder.name || '',
            status: selectedResponder.status as any,
            agencyId: selectedAgencyId || '',
          }
        : undefined
    );

    if (!validation.valid) {
      toast({
        title: 'Validation Error',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    // Create dispatch
    createDispatch.mutate({
      incidentId,
      agencyId: selectedAgencyId,
      responderId: selectedResponderIds[0] || undefined,
      priority,
      notes: notes || undefined,
    });
  };

  if (incidentLoading || !incident) {
    return (
      <RootLayout>
        <DashboardShell isLoading={true}>
          <div>Loading...</div>
        </DashboardShell>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <DashboardShell
        title="Dispatch Assignment"
        description={`Assigning: ${incident.title}`}
      >
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Side: Incident Details and Map (60%) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Incident Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Title: </span>
                    <span>{incident.title}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Category: </span>
                    <Badge variant="outline">{incident.category}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Severity: </span>
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
                  </div>
                  <div>
                    <span className="text-sm font-medium">Location: </span>
                    <span className="text-sm text-muted-foreground">
                      {incident.district}, {incident.region}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Reported: </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(incident.createdAt), 'PPp')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location Map</CardTitle>
              </CardHeader>
              <CardContent>
                <LiveIncidentMap
                  incidents={[
                    {
                      id: incident.id,
                      title: incident.title,
                      severity: incident.severity,
                      status: incident.status,
                      category: incident.category,
                      latitude: incident.latitude,
                      longitude: incident.longitude,
                      createdAt: incident.createdAt,
                      district: incident.district,
                      region: incident.region,
                    },
                  ]}
                  agencies={agencies || []}
                  showAgencies={true}
                  showResponders={false}
                  className="h-96"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Side: Agency and Responder Selection (40%) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Agency Recommendations */}
            <AgencyRecommendations
              incident={{
                category: incident.category,
                severity: incident.severity,
                latitude: incident.latitude,
                longitude: incident.longitude,
              }}
              agencies={agenciesWithStats}
              selectedAgencyId={selectedAgencyId}
              onSelectAgency={setSelectedAgencyId}
            />

            {/* Responder Selection */}
            {selectedAgencyId && responders && (
              <ResponderSelector
                responders={responders.map((r) => ({
                  id: r.id,
                  name: r.name || 'Unknown',
                  status: r.status as any,
                  agencyId: selectedAgencyId || '',
                }))}
                incidentLocation={{
                  latitude: incident.latitude,
                  longitude: incident.longitude,
                }}
                selectedResponderIds={selectedResponderIds}
                onSelectionChange={setSelectedResponderIds}
                multiSelect={false}
              />
            )}

            {/* Priority and Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="priority">Priority (1-5)</Label>
                  <Select
                    value={priority.toString()}
                    onValueChange={(value) => setPriority(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((p) => (
                        <SelectItem key={p} value={p.toString()}>
                          {p} - {p === 5 ? 'Urgent' : p === 1 ? 'Routine' : 'Standard'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Dispatch Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional instructions for responders..."
                    rows={4}
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
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/dispatch">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </Button>
              <Button variant="outline" disabled>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button onClick={handleDispatch} disabled={createDispatch.isPending || !selectedAgencyId}>
                <Send className="mr-2 h-4 w-4" />
                {createDispatch.isPending ? 'Dispatching...' : 'Dispatch'}
              </Button>
            </div>
          </div>
        </div>
      </DashboardShell>
    </RootLayout>
  );
}

