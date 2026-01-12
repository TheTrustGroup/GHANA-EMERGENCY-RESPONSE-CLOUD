'use client';

/**
 * DispatchStatusBadge Component
 * Badge showing dispatch assignment status
 */

import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Navigation, MapPin, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type DispatchStatus = 'dispatched' | 'accepted' | 'en_route' | 'arrived' | 'completed';

interface DispatchStatusBadgeProps {
  status: DispatchStatus;
  className?: string;
}

const statusConfig: Record<
  DispatchStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  dispatched: {
    label: 'Dispatched',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
  },
  en_route: {
    label: 'En Route',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Navigation,
  },
  arrived: {
    label: 'Arrived',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: MapPin,
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
  },
};

export function DispatchStatusBadge({ status, className }: DispatchStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('flex items-center gap-1.5 border', config.color, className)}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

