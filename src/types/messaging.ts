/**
 * Messaging Types
 * Shared types for the messaging system
 */

import { UserRole } from '@prisma/client';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
    role: UserRole | string;
    email: string | null;
  };
  isSystemMessage: boolean;
  isUrgent?: boolean;
  createdAt: Date | string;
  mediaUrls?: string[];
}

export interface Participant {
  id: string;
  name: string;
  role: UserRole;
  email: string | null;
  isOnline?: boolean;
  lastSeen?: Date;
}

