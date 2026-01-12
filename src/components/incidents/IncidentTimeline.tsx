'use client';

/**
 * IncidentTimeline Component
 * Vertical timeline of incident events
 */

import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  MessageSquare,
  UserCheck,
  XCircle,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  type: 'created' | 'status_changed' | 'agency_assigned' | 'responder_assigned' | 'update' | 'resolved' | 'closed';
  description: string;
  user?: {
    name: string | null;
    role: string;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface IncidentTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const eventIcons = {
  created: AlertCircle,
  status_changed: ArrowRight,
  agency_assigned: Building2,
  responder_assigned: UserCheck,
  update: MessageSquare,
  resolved: CheckCircle,
  closed: XCircle,
};

const eventColors = {
  created: 'bg-blue-500',
  status_changed: 'bg-yellow-500',
  agency_assigned: 'bg-purple-500',
  responder_assigned: 'bg-green-500',
  update: 'bg-gray-500',
  resolved: 'bg-green-600',
  closed: 'bg-gray-600',
};

export function IncidentTimeline({ events, className }: IncidentTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={cn('rounded-lg border p-6 text-center text-muted-foreground', className)}>
        <Clock className="mx-auto mb-2 h-8 w-8" />
        <p>No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {events.map((event, index) => {
        const Icon = eventIcons[event.type] || Clock;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-12 h-full w-0.5 bg-border" />
            )}

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white',
                eventColors[event.type]
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{event.description}</p>
                  {event.user && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      by {event.user.name || 'Unknown'} ({event.user.role})
                    </p>
                  )}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-2 rounded bg-muted p-2 text-xs">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="ml-4 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

