'use client';

/**
 * Incidents List Page
 * Paginated table of incidents with filters and sorting
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Download, Plus, Search, Filter } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IncidentCard } from '@/components/incidents/IncidentCard';
import { useResponsive } from '@/hooks/useResponsive';
import { trpc } from '@/lib/trpc/client';
import { IncidentStatus, IncidentSeverity } from '@prisma/client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

export default function IncidentsPage() {
  const { isMobile } = useResponsive();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'severity' | 'status'>('createdAt');

  const { data, isLoading } = trpc.incidents.getAll.useQuery({
    page,
    pageSize: 20,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    severity: severityFilter !== 'all' ? severityFilter : undefined,
    sortBy,
    sortOrder: 'desc',
  });

  const handleExport = () => {
    // TODO: Implement CSV export
    alert('Export functionality coming soon');
  };

  const incidents = data?.incidents || [];
  const pagination = data?.pagination;

  return (
    <RootLayout>
      <DashboardShell
        title="Incidents"
        description="View and manage all reported incidents"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/dashboard/incidents/new">
                <Plus className="mr-2 h-4 w-4" />
                New Incident
              </Link>
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as IncidentStatus | 'all');
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(IncidentStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Severity</label>
              <Select
                value={severityFilter}
                onValueChange={(value) => {
                  setSeverityFilter(value as IncidentSeverity | 'all');
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  {Object.values(IncidentSeverity).map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Sort By</label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'createdAt' | 'severity' | 'status')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="severity">Severity</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading incidents...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground">No incidents found</p>
          </div>
        ) : isMobile ? (
          /* Mobile Card View */
          <div className="grid gap-4">
            {incidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                id={incident.id}
                title={incident.title}
                status={incident.status}
                severity={incident.severity}
                region={incident.region}
                district={incident.district}
                reportedBy={(incident as any).reportedBy}
                createdAt={incident.createdAt}
                assignedAgency={(incident as any).assignedAgency}
              />
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <Badge className={cn('text-xs', statusColors[incident.status])}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', severityColors[incident.severity])}>
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{incident.title}</TableCell>
                    <TableCell>{incident.category}</TableCell>
                    <TableCell>
                      {incident.district}, {incident.region}
                    </TableCell>
                    <TableCell>
                      {incident.agencies?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell>{incident.users?.name || 'Unknown'}</TableCell>
                    <TableCell>{format(new Date(incident.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/incidents/${incident.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(page * pagination.pageSize, pagination.total)} of {pagination.total}{' '}
              incidents
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardShell>
    </RootLayout>
  );
}

