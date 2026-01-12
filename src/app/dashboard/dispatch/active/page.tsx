'use client';

/**
 * Active Dispatches Page
 * View and manage all active dispatch assignments
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Download, MessageSquare, Navigation, RefreshCw } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DispatchStatusBadge } from '@/components/dispatch/DispatchStatusBadge';
import { ResponderTrackingDialog } from '@/components/dispatch/ResponderTrackingDialog';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { DispatchStatus } from '@prisma/client';

export default function ActiveDispatchesPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agencyFilter, setAgencyFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedDispatchId, setSelectedDispatchId] = useState<string | undefined>();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>();

  // Fetch active dispatches
  const { data: dispatches, refetch } = trpc.dispatch.getAllActive.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Fetch agencies for filter
  const { data: agencies } = trpc.agencies.getAll.useQuery(undefined);

  // Filter dispatches
  const filteredDispatches = (dispatches || []).filter((dispatch: any) => {
    if (statusFilter !== 'all' && dispatch.status !== statusFilter) return false;
    if (agencyFilter !== 'all' && dispatch.agencyId !== agencyFilter) return false;
    if (priorityFilter !== 'all' && dispatch.priority.toString() !== priorityFilter) return false;
    return true;
  });

  const handleTrack = (dispatchId: string, incidentId: string) => {
    setSelectedDispatchId(dispatchId);
    setSelectedIncidentId(incidentId);
    setTrackingDialogOpen(true);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast({
      title: 'Export',
      description: 'Export functionality coming soon',
    });
  };

  const handleSendReminder = () => {
    // TODO: Implement reminder
    toast({
      title: 'Reminder',
      description: 'Reminder sent to responder',
    });
  };

  return (
    <RootLayout>
      <DashboardShell
        title="Active Dispatches"
        description="Manage all active dispatch assignments"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="en_route">En Route</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Agency</label>
                <Select value={agencyFilter} onValueChange={setAgencyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agencies</SelectItem>
                    {agencies?.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {[1, 2, 3, 4, 5].map((p) => (
                      <SelectItem key={p} value={p.toString()}>
                        {p} - {p === 5 ? 'Urgent' : p === 1 ? 'Routine' : 'Standard'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispatches Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Active Dispatches ({filteredDispatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDispatches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active dispatches</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Responder</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Dispatched</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDispatches.map((dispatch: any) => (
                    <TableRow key={dispatch.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/incidents/${dispatch.incidentId}`}
                          className="font-medium hover:underline"
                        >
                          {dispatch.incident?.title || dispatch.incidentId}
                        </Link>
                      </TableCell>
                      <TableCell>{dispatch.agency?.name || dispatch.agencyId}</TableCell>
                      <TableCell>
                        {dispatch.responder?.name || (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DispatchStatusBadge status={dispatch.status as any} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{dispatch.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(dispatch.dispatchedAt), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dispatch.status === DispatchStatus.EN_ROUTE ? '~15 min' : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTrack(dispatch.id, dispatch.incidentId)}
                          >
                            <Navigation className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {dispatch.status === DispatchStatus.DISPATCHED && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSendReminder}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Tracking Dialog */}
        {selectedDispatchId && selectedIncidentId && (
          <ResponderTrackingDialog
            open={trackingDialogOpen}
            onOpenChange={setTrackingDialogOpen}
            dispatchId={selectedDispatchId}
            incidentId={selectedIncidentId}
          />
        )}
      </DashboardShell>
    </RootLayout>
  );
}

