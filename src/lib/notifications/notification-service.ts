/**
 * Notification Service
 * Central service for all notification operations
 */

import { prisma } from '@/server/db';
import { UserRole, NotificationType } from '@prisma/client';

// Re-export for convenience
export { NotificationType };
import { sendSMS } from './sms-service';
// import { sendPushNotification } from './push-service'; // TODO: Implement server-side push
// Pusher server SDK - would need to be installed: npm install pusher
// import Pusher from 'pusher';

// Initialize Pusher server
// const pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID || '',
//   key: process.env.PUSHER_KEY || '',
//   secret: process.env.PUSHER_SECRET || '',
//   cluster: process.env.PUSHER_CLUSTER || 'mt1',
//   useTLS: true,
// });
const pusher: any = null; // Placeholder - install pusher package for server-side

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: 'incident' | 'dispatch' | 'message' | 'agency' | null;
  relatedEntityId?: string | null;
  metadata?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface NotificationPreferences {
  inApp: boolean;
  push: boolean;
  sms: boolean;
  email: boolean;
  frequency: 'instant' | 'batched' | 'daily';
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
  enabledTypes: NotificationType[];
}

/**
 * Create a notification
 */
export async function createNotification(userId: string, data: NotificationData) {
  const notification = await prisma.notifications.create({
    data: {
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedEntityType: data.relatedEntityType,
      relatedEntityId: data.relatedEntityId,
    },
  });

  // Send via appropriate channels
  await sendToUser(userId, notification);

  return notification;
}

/**
 * Send notification to a specific user
 */
export async function sendToUser(userId: string, notification: any) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  if (!user) return;

  // TODO: Get preferences from user settings table or use defaults
  const preferences: NotificationPreferences = {
    inApp: true,
    push: false,
    sms: false,
    email: false,
    frequency: 'instant',
    enabledTypes: Object.values(NotificationType),
  };

  // Check if notification type is enabled
  if (!preferences.enabledTypes.includes(notification.type)) {
    return;
  }

  // Check quiet hours
  if (isInQuietHours(preferences)) {
    // Only send critical notifications during quiet hours
    if (notification.priority !== 'critical') {
      return;
    }
  }

  // Always send in-app notification
  await triggerPusherNotification('user', userId, notification);

  // Send push notification if enabled
  // TODO: Get push subscriptions from database
  if (preferences.push) {
    // Push subscriptions would be fetched from a separate table
    // For now, this is a placeholder
  }

  // Send SMS if enabled and critical/high priority
  if (
    preferences.sms &&
    user.phone &&
    (notification.priority === 'critical' || notification.priority === 'high')
  ) {
    try {
      const smsMessage = formatSMSMessage(notification);
      await sendSMS(user.phone, smsMessage);
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  }
}

/**
 * Send notification to all users in an agency
 */
export async function sendToAgency(agencyId: string, data: NotificationData) {
  const agency = await prisma.agencies.findUnique({
    where: { id: agencyId },
    include: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!agency) return;

  const userIds = agency.users.map((u: { id: string }) => u.id);
  await sendBulk(userIds, data);
}

/**
 * Send notification to all users with a specific role
 */
export async function sendToRole(role: UserRole, data: NotificationData) {
  const users = await prisma.users.findMany({
    where: { role },
    select: { id: true },
  });

  const userIds = users.map((u: { id: string }) => u.id);
  await sendBulk(userIds, data);
}

/**
 * Send notification to multiple users
 */
export async function sendBulk(userIds: string[], data: NotificationData) {
  const notifications = await Promise.all(
    userIds.map((userId) => createNotification(userId, data))
  );

  return notifications;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notifications.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return await prisma.notifications.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  return prisma.notifications.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notifications.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Trigger Pusher notification
 */
async function triggerPusherNotification(
  channelType: 'user' | 'agency' | 'role' | 'system',
  identifier: string,
  notification: any
) {
  const channelName = `${channelType}-${identifier}`;

  try {
    await pusher.trigger(channelName, 'notification.created', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
      relatedEntityType: notification.relatedEntityType,
      relatedEntityId: notification.relatedEntityId,
    });
  } catch (error) {
    console.error('Failed to trigger Pusher notification:', error);
  }
}

/**
 * Check if current time is in quiet hours
 */
function isInQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
    return false;
  }

  const now = new Date();
  // const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`; // Not used

  const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
  void currentTimeMinutes; // Used in return statement

  // Handle overnight quiet hours (e.g., 22:00 - 06:00)
  if (startTime > endTime) {
    return currentTimeMinutes >= startTime || currentTimeMinutes <= endTime;
  }

  return currentTimeMinutes >= startTime && currentTimeMinutes <= endTime;
}

/**
 * Format notification message for SMS
 */
function formatSMSMessage(notification: any): string {
  const baseMessage = `${notification.title}: ${notification.message}`;

  // Add URL for incidents if available
  if (notification.relatedEntityType === 'incident' && notification.relatedEntityId) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://emergency.ghana.gov.gh';
    return `${baseMessage} View: ${baseUrl}/dashboard/incidents/${notification.relatedEntityId}`;
  }

  return baseMessage;
}
