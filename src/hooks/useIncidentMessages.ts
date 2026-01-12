'use client';

/**
 * useIncidentMessages Hook
 * Hook for fetching and subscribing to incident messages
 */

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import Pusher from 'pusher-js';
import type { Message } from '@/types/messaging';

interface UseIncidentMessagesOptions {
  incidentId: string;
  pageSize?: number;
  enabled?: boolean;
}

// Initialize Pusher client
let pusher: Pusher | null = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_KEY) {
  pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  });
}

export function useIncidentMessages({
  incidentId,
  pageSize = 20,
  enabled = true,
}: UseIncidentMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch messages
  const {
    data: messagesData,
    isLoading,
    refetch,
  } = trpc.messages.getByIncident.useQuery(
    {
      incidentId,
      page,
      pageSize,
    },
    {
      enabled: enabled && !!incidentId,
      refetchInterval: 30000, // Refetch every 30 seconds as fallback
    }
  );

  // Send message mutation
  const sendMessageMutation = trpc.messages.create.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = trpc.messages.markAsRead.useMutation();

  // Update messages when data changes
  useEffect(() => {
    if (messagesData) {
      if (page === 1) {
        setMessages(messagesData.messages);
      } else {
        setMessages((prev) => [...messagesData.messages, ...prev]);
      }
      setHasMore(messagesData.hasMore);
    }
  }, [messagesData, page]);

  // Subscribe to Pusher channel for real-time updates
  useEffect(() => {
    if (!pusher || !incidentId || !enabled) return;

    const channel = pusher.subscribe(`incident-${incidentId}-messages`);

    // New message
    channel.bind('message.created', (data: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        const existing = prev.find((m) => m.id === data.id);
        if (existing) {
          return prev;
        }
        return [...prev, data];
      });

      // Show notification if not viewing
      if (document.hidden) {
        toast({
          title: 'New message',
          description: data.sender?.name || 'System',
        });
      }
    });

    // Typing indicator
    channel.bind('user.typing', (data: { userId: string; userName: string }) => {
      setTypingUsers((prev) => new Set(prev).add(data.userId));
      setIsTyping(true);

      setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          if (next.size === 0) {
            setIsTyping(false);
          }
          return next;
        });
      }, 3000);
    });

    // User stopped typing
    channel.bind('user.stopped-typing', (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        if (next.size === 0) {
          setIsTyping(false);
        }
        return next;
      });
    });

    return () => {
      pusher?.unsubscribe(`incident-${incidentId}-messages`);
    };
  }, [incidentId, enabled, toast]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && !document.hidden) {
      const unreadIds = messages
        .filter((m) => !m.isSystemMessage)
        .map((m) => m.id);
      
      if (unreadIds.length > 0) {
        markAsReadMutation.mutate({ messageIds: unreadIds });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const sendMessage = useCallback(
    (content: string, mediaUrls?: string[]) => {
      sendMessageMutation.mutate({
        incidentId,
        content,
        mediaUrls,
      });
    },
    [incidentId, sendMessageMutation]
  );

  const broadcastTyping = useCallback(() => {
    if (!pusher || !incidentId) return;

    const channel = pusher.channel(`incident-${incidentId}-messages`);
    if (channel) {
      channel.trigger('client-user-typing', {
        userId: 'current', // Would get from session
      });
    }
  }, [incidentId]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoading]);

  const typingIndicatorText = typingUsers.size > 0
    ? `${Array.from(typingUsers).length} user${typingUsers.size > 1 ? 's' : ''} typing...`
    : null;

  return {
    messages,
    isLoading,
    hasMore,
    isTyping,
    typingIndicatorText,
    sendMessage,
    broadcastTyping,
    loadMore,
    refetch,
  };
}

