'use client';

/**
 * AssignmentCard Component
 * Compact card for displaying assignment information
 */

import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, Navigation, Phone, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IncidentSeverity } from '@prisma/client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { DispatchStatusBadge } from '@/components/dispatch/DispatchStatusBadge';
import { formatETA } from '@/lib/dispatch-logic';

interface AssignmentCardProps {
  id: string;
  incidentId: string;
  title: string;
  severity: IncidentSeverity;
  status: 'dispatched' | 'accepted' | 'en_route' | 'arrived' | 'completed';
  address?: string | null;
  district?: string;
  region?: string;
  distance?: number;
  eta?: number;
  dispatchedAt: Date;
  acceptedAt?: Date | null;
  arrivedAt?: Date | null;
  priority: number;
  onGetDirections?: () => void;
  onCallDispatch?: () => void;
  onUpdateStatus?: () => void;
  className?: string;
}

const severityColors: Record<IncidentSeverity, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
  CRITICAL: '#991b1b',
};

export function AssignmentCard({
  id,
  incidentId: _incidentId,
  title,
  severity,
  status,
  address,
  district,
  region,
  distance,
  eta,
  dispatchedAt,
  acceptedAt,
  arrivedAt,
  priority,
  onGetDirections,
  onCallDispatch,
  onUpdateStatus,
  className,
}: AssignmentCardProps) {
  const severityColor = severityColors[severity];
  const location = address || `${district || ''}, ${region || ''}`.trim() || 'Location unknown';

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        className
      )}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: severityColor,
      }}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                style={{ backgroundColor: severityColor, color: 'white' }}
                className="text-xs"
              >
                {severity}
              </Badge>
              <DispatchStatusBadge status={status} />
              {priority >= 4 && (
                <Badge variant="destructive" className="text-xs">
                  Priority {priority}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mb-3 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-2">{location}</span>
        </div>

        {/* Distance and ETA */}
        {(distance !== undefined || eta !== undefined) && (
          <div className="mb-3 flex items-center gap-4 text-sm">
            {distance !== undefined && (
              <div className="flex items-center gap-1">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span>{distance.toFixed(1)} km</span>
              </div>
            )}
            {eta !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatETA(eta)}</span>
              </div>
            )}
          </div>
        )}

        {/* Status Timeline */}
        <div className="mb-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={cn('h-2 w-2 rounded-full', status !== 'dispatched' ? 'bg-green-500' : 'bg-gray-300')} />
            <span>Dispatched {formatDistanceToNow(dispatchedAt, { addSuffix: true })}</span>
          </div>
          {acceptedAt && (
            <div className="flex items-center gap-2">
              <div className={cn('h-2 w-2 rounded-full', ['accepted', 'en_route', 'arrived', 'completed'].includes(status) ? 'bg-green-500' : 'bg-gray-300')} />
              <span>Accepted {formatDistanceToNow(acceptedAt, { addSuffix: true })}</span>
            </div>
          )}
          {arrivedAt && (
            <div className="flex items-center gap-2">
              <div className={cn('h-2 w-2 rounded-full', ['arrived', 'completed'].includes(status) ? 'bg-green-500' : 'bg-gray-300')} />
              <span>Arrived {formatDistanceToNow(arrivedAt, { addSuffix: true })}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {onGetDirections && (
            <Button
              size="sm"
              variant="outline"
              onClick={onGetDirections}
              className="w-full"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Directions
            </Button>
          )}
          {onCallDispatch && (
            <Button
              size="sm"
              variant="outline"
              onClick={onCallDispatch}
              className="w-full"
            >
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
          )}
          {onUpdateStatus && (
            <Button
              size="sm"
              onClick={onUpdateStatus}
              className="w-full"
            >
              Update Status
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            asChild
            className="w-full"
          >
            <Link href={`/dashboard/responder/assignment/${id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

