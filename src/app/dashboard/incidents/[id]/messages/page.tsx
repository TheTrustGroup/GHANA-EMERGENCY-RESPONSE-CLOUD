'use client';

/**
 * Incident Messages Page
 * Chat interface for incident-related communication
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageList } from '@/components/messaging/MessageList';
import { MessageInput } from '@/components/messaging/MessageInput';
import { ParticipantsList } from '@/components/messaging/ParticipantsList';
import { useIncidentMessages } from '@/hooks/useIncidentMessages';
import { trpc } from '@/lib/trpc/client';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function IncidentMessagesPage() {
  const params = useParams();
  const { data: session } = useSession();
  const incidentId = params.id as string;
  const [showParticipants, setShowParticipants] = useState(false);

  // Fetch incident details
  const { data: incident, isLoading: incidentLoading } = trpc.incidents.getById.useQuery(
    { id: incidentId },
    { refetchInterval: 30000 }
  );

  // Fetch participants
  const { data: participants } = trpc.messages.getParticipants.useQuery(
    { incidentId },
    { refetchInterval: 60000 }
  );

  // Use messages hook
  const {
    messages,
    isLoading: messagesLoading,
    hasMore,
    isTyping,
    typingIndicatorText,
    sendMessage,
    broadcastTyping,
    loadMore,
  } = useIncidentMessages({
    incidentId,
    enabled: !!incidentId,
  });

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show notification when new message arrives (if tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.isSystemMessage && lastMessage.senderId !== session?.user?.id) {
          if (Notification.permission === 'granted') {
            new Notification('New message', {
              body: `${lastMessage.sender?.name || 'Someone'}: ${lastMessage.content.substring(0, 50)}`,
              icon: '/favicon.ico',
            });
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [messages, session]);

  if (incidentLoading || !incident) {
    return (
      <RootLayout>
        <DashboardShell isLoading={true}>
          <div>Loading...</div>
        </DashboardShell>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <DashboardShell
        title={`Messages: ${incident.title}`}
        description="Incident communication"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/incidents/${incidentId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Incident
              </Link>
            </Button>
          </div>
        }
      >
        <div className="flex h-[calc(100vh-8rem)] gap-4">
          {/* Main Chat Area */}
          <div className={cn('flex flex-col flex-1', showParticipants && 'lg:w-2/3')}>
            <Card className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="border-b p-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{incident.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {participants?.length || 0} participant{participants?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Messages List */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <MessageList
                  messages={messages}
                  isLoading={messagesLoading}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                />
              </CardContent>

              {/* Typing Indicator */}
              {isTyping && typingIndicatorText && (
                <div className="px-4 py-2 text-sm text-muted-foreground italic">
                  {typingIndicatorText}
                </div>
              )}

              {/* Message Input */}
              <MessageInput
                onSend={sendMessage}
                onTyping={broadcastTyping}
                disabled={messagesLoading}
                placeholder="Type a message..."
              />
            </Card>
          </div>

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="hidden lg:block w-1/3">
              <ParticipantsList
                participants={participants || []}
                currentUserId={session?.user?.id}
              />
            </div>
          )}
        </div>

        {/* Mobile Participants Sheet */}
        {showParticipants && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <div className="h-full flex flex-col">
              <div className="border-b p-4 flex items-center justify-between">
                <h2 className="font-semibold">Participants</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowParticipants(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <ParticipantsList
                  participants={participants || []}
                  currentUserId={session?.user?.id}
                />
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </RootLayout>
  );
}

