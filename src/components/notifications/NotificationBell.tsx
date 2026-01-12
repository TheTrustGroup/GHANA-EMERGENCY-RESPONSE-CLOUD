'use client';

/**
 * NotificationBell Component
 * Bell icon with unread count badge and dropdown
 */

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationCard } from './NotificationCard';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Pusher from 'pusher-js';

// Initialize Pusher client
let pusher: Pusher | null = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_KEY) {
  pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  });
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { data, refetch } = trpc.notifications.getMyNotifications.useQuery(
    { limit: 5, unreadOnly: false },
    { refetchInterval: 30000 }
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!pusher) return;

    // This would need the user ID from session
    // For now, we'll use a placeholder
    const channel = pusher.subscribe('user-notifications');

    channel.bind('notification.created', () => {
      refetch();
    });

    return () => {
      pusher?.unsubscribe('user-notifications');
    };
  }, [refetch]);

  const handleNotificationClick = (notification: any) => {
    if (notification.relatedEntityType === 'incident' && notification.relatedEntityId) {
      router.push(`/dashboard/incidents/${notification.relatedEntityId}`);
    } else if (notification.relatedEntityType === 'message' && notification.relatedEntityId) {
      router.push(`/dashboard/incidents/${notification.relatedEntityId}/messages`);
    }
    setIsOpen(false);
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate({ id });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          <div className="p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkRead={handleMarkAsRead}
                />
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Link href="/dashboard/notifications">
            <Button variant="outline" className="w-full">
              View All Notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

