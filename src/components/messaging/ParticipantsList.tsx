'use client';

/**
 * ParticipantsList Component
 * Sidebar showing all participants in the incident chat
 */

import { User, Shield, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@prisma/client';
import { cn } from '@/lib/utils';
import type { Participant } from '@/types/messaging';

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId?: string;
}

const roleIcons: Record<UserRole, typeof User> = {
  CITIZEN: User,
  RESPONDER: User,
  DISPATCHER: Shield,
  AGENCY_ADMIN: Building2,
  SYSTEM_ADMIN: Shield,
};

export function ParticipantsList({ participants, currentUserId }: ParticipantsListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'bg-red-100 text-red-800';
      case 'AGENCY_ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'DISPATCHER':
        return 'bg-purple-100 text-purple-800';
      case 'RESPONDER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Participants ({participants.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="p-4 space-y-3">
            {participants.map((participant) => {
              const Icon = roleIcons[participant.role] || User;
              const isCurrentUser = participant.id === currentUserId;

              return (
                <div
                  key={participant.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-lg transition-colors',
                    isCurrentUser && 'bg-blue-50'
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(participant.name)}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-medium truncate', isCurrentUser && 'text-blue-900')}>
                        {participant.name}
                        {isCurrentUser && ' (You)'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn('text-xs', getRoleColor(participant.role))}>
                        <Icon className="mr-1 h-3 w-3" />
                        {participant.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

