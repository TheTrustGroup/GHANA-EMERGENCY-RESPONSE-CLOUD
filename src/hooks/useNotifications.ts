'use client';

/**
 * useNotifications Hook
 * Hook for managing notifications
 */

import { useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import Pusher from 'pusher-js';

// Initialize Pusher client
let pusher: Pusher | null = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_KEY) {
  pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  });
}

interface UseNotificationsOptions {
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    limit = 20,
    unreadOnly = false,
    type,
    enabled = true,
  } = options;

  // const [page, setPage] = useState(1); // For future pagination

  const {
    data,
    isLoading,
    refetch,
  } = trpc.notifications.getMyNotifications.useQuery(
    { limit, unreadOnly },
    {
      enabled,
      refetchInterval: 30000,
    }
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!pusher || !enabled) return;

    const channel = pusher.subscribe('user-notifications');

    channel.bind('notification.created', () => {
      refetch();
    });

    return () => {
      pusher?.unsubscribe('user-notifications');
    };
  }, [enabled, refetch]);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Filter by type if specified
  const filteredNotifications = type
    ? notifications.filter((n) => n.type === type)
    : notifications;

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate({ id });
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return {
    notifications: filteredNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  };
}

