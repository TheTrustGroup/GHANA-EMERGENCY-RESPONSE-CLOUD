'use client';

/**
 * MessageBubble Component
 * Individual message display component
 */

import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messaging';

export interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = true,
}: MessageBubbleProps) {
  const senderInitials = message.sender?.name
    ? message.sender.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const isSystem = message.isSystemMessage;
  const isUrgent = message.isUrgent;

  // Format links in content
  const formatContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full max-w-md text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {showAvatar && !isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.email ? undefined : undefined} />
          <AvatarFallback className="text-xs">
            {senderInitials}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col max-w-[70%]',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        {!isOwnMessage && message.sender && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {message.sender.name}
            </span>
            <Badge variant="outline" className="text-xs">
              {message.sender.role.replace('_', ' ')}
            </Badge>
            {isUrgent && (
              <AlertTriangle className="h-3 w-3 text-red-600" />
            )}
          </div>
        )}

        <div
          className={cn(
            'rounded-lg px-4 py-2 break-words',
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900',
            isUrgent && !isOwnMessage && 'border-2 border-red-500'
          )}
        >
          <div className="text-sm whitespace-pre-wrap">
            {formatContent(message.content)}
          </div>

          {message.mediaUrls && message.mediaUrls.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.mediaUrls.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Attachment ${index + 1}`}
                  width={800}
                  height={600}
                  className="max-w-full h-auto rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>

        {showTimestamp && (
          <span className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        )}
      </div>

      {showAvatar && isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="text-xs bg-blue-600 text-white">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

