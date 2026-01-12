'use client';

/**
 * IncidentCard Component
 * Compact incident card for grid/list views
 */

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IncidentStatus, IncidentSeverity } from '@prisma/client';

interface IncidentCardProps {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  region: string;
  district: string;
  reportedBy?: {
    name: string | null;
  };
  createdAt: Date;
  assignedAgency?: {
    name: string;
  } | null;
  className?: string;
}

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

export function IncidentCard({
  id,
  title,
  status,
  severity,
  region,
  district,
  reportedBy,
  createdAt,
  assignedAgency,
  className,
}: IncidentCardProps) {
  return (
    <Link href={`/dashboard/incidents/${id}`}>
      <Card className={cn('cursor-pointer transition-all hover:shadow-md', className)}>
        <div className="p-4">
          {/* Header with badges */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="flex-1 font-semibold line-clamp-2">{title}</h3>
            <div className="flex flex-col gap-1">
              <Badge className={cn('text-xs', statusColors[status])}>{status}</Badge>
              <Badge className={cn('text-xs', severityColors[severity])}>{severity}</Badge>
            </div>
          </div>

          {/* Location */}
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {district}, {region}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {reportedBy && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{reportedBy.name || 'Unknown'}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            {assignedAgency && (
              <span className="text-xs font-medium">{assignedAgency.name}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

