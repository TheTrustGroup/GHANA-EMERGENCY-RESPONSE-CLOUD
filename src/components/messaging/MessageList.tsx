'use client';

/**
 * MessageList Component
 * Renders list of messages with auto-scroll and infinite scroll
 */

import { useEffect, useRef, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { MessageBubble } from './MessageBubble';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSession } from 'next-auth/react';
import type { Message } from '@/types/messaging';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  unreadMarkerIndex?: number;
}

export function MessageList({
  messages,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  unreadMarkerIndex,
}: MessageListProps) {
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt;
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    
    return groups;
  }, {} as Record<string, Message[]>);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isScrolledToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isScrolledToBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    setIsScrolledToBottom(isAtBottom);

    // Load more when scrolling to top
    if (target.scrollTop < 100 && hasMore && !isLoadingMore && onLoadMore) {
      setIsLoadingMore(true);
      onLoadMore();
      setTimeout(() => setIsLoadingMore(false), 500);
    }
  };

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy');
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId === session?.user?.id;
  };

  const shouldShowAvatar = (currentMessage: Message, previousMessage: Message | null) => {
    if (!previousMessage) return true;
    if (currentMessage.isSystemMessage) return false;
    if (previousMessage.isSystemMessage) return true;
    if (currentMessage.senderId !== previousMessage.senderId) return true;
    
    // Show avatar if messages are more than 5 minutes apart
    const currentTime = typeof currentMessage.createdAt === 'string' ? new Date(currentMessage.createdAt) : currentMessage.createdAt;
    const previousTime = typeof previousMessage.createdAt === 'string' ? new Date(previousMessage.createdAt) : previousMessage.createdAt;
    const timeDiff = currentTime.getTime() - previousTime.getTime();
    return timeDiff > 5 * 60 * 1000;
  };

  const shouldShowTimestamp = (currentMessage: Message, nextMessage: Message | null) => {
    if (!nextMessage) return true;
    if (currentMessage.isSystemMessage) return false;
    
    // Show timestamp if messages are more than 2 minutes apart
    const nextTime = typeof nextMessage.createdAt === 'string' ? new Date(nextMessage.createdAt) : nextMessage.createdAt;
    const currentTime = typeof currentMessage.createdAt === 'string' ? new Date(currentMessage.createdAt) : currentMessage.createdAt;
    const timeDiff = nextTime.getTime() - currentTime.getTime();
    return timeDiff > 2 * 60 * 1000;
  };

  return (
    <div
      className="flex-1 h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      <div className="p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, dateMessages]) => {
            const date = new Date(dateKey);
            return (
              <div key={dateKey}>
                {/* Date Separator */}
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 border-t" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatDateHeader(date)}
                  </span>
                  <div className="flex-1 border-t" />
                </div>

                {/* Unread Marker */}
                {unreadMarkerIndex !== undefined && 
                 dateMessages.findIndex((m) => m.id === messages[unreadMarkerIndex]?.id) !== -1 && (
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 border-t border-blue-500" />
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Unread messages
                    </span>
                    <div className="flex-1 border-t border-blue-500" />
                  </div>
                )}

                {/* Messages */}
                {dateMessages.map((message, index) => {
                  const previousMessage = index > 0 ? dateMessages[index - 1] : null;
                  const nextMessage = index < dateMessages.length - 1 ? dateMessages[index + 1] : null;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage(message)}
                      showAvatar={shouldShowAvatar(message, previousMessage)}
                      showTimestamp={shouldShowTimestamp(message, nextMessage)}
                    />
                  );
                })}
              </div>
            );
          })
        )}

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

