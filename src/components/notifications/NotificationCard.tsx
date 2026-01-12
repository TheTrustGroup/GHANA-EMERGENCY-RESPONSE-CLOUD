'use client';

/**
 * NotificationCard Component
 * Card component for displaying individual notifications
 */

import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  MessageSquare,
  Radio,
  Shield,
  X,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  createdAt: Date | string;
}

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const typeIcons: Record<string, typeof Bell> = {
  INCIDENT_CREATED: AlertTriangle,
  INCIDENT_ASSIGNED: Shield,
  DISPATCH_ASSIGNMENT: Radio,
  STATUS_UPDATE: CheckCircle,
  MESSAGE_RECEIVED: MessageSquare,
  INCIDENT_RESOLVED: CheckCircle,
  SYSTEM_ALERT: Bell,
  REMINDER: Clock,
};

const typeColors: Record<string, string> = {
  INCIDENT_CREATED: 'text-orange-600',
  INCIDENT_ASSIGNED: 'text-blue-600',
  DISPATCH_ASSIGNMENT: 'text-purple-600',
  STATUS_UPDATE: 'text-green-600',
  MESSAGE_RECEIVED: 'text-indigo-600',
  INCIDENT_RESOLVED: 'text-green-600',
  SYSTEM_ALERT: 'text-red-600',
  REMINDER: 'text-yellow-600',
};

export function NotificationCard({
  notification,
  onClick,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  const router = useRouter();
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || 'text-gray-600';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to related entity
      if (notification.relatedEntityType === 'incident' && notification.relatedEntityId) {
        router.push(`/dashboard/incidents/${notification.relatedEntityId}`);
      } else if (notification.relatedEntityType === 'dispatch' && notification.relatedEntityId) {
        router.push(`/dashboard/dispatch/active`);
      } else if (notification.relatedEntityType === 'message' && notification.relatedEntityId) {
        // Extract incident ID from message metadata or navigate to messages
        router.push(`/dashboard/incidents/${notification.relatedEntityId}/messages`);
      }
    }
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkRead && !notification.isRead) {
      onMarkRead(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        !notification.isRead && 'border-l-4 border-l-blue-500 bg-blue-50/50'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('flex-shrink-0 mt-1', colorClass)}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn('font-semibold text-sm', !notification.isRead && 'font-bold')}>
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(
                      typeof notification.createdAt === 'string'
                        ? new Date(notification.createdAt)
                        : notification.createdAt,
                      { addSuffix: true }
                    )}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {notification.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && onMarkRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleMarkRead}
                    title="Mark as read"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={handleDelete}
                    title="Delete"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

