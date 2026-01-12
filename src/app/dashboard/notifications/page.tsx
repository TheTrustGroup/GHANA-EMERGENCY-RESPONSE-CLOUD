'use client';

/**
 * Notifications Page
 * Notifications center with filtering and management
 */

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { useNotifications } from '@/hooks/useNotifications';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const notificationTypes = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'INCIDENT_CREATED', label: 'Incidents' },
  { value: 'DISPATCH_ASSIGNMENT', label: 'Dispatches' },
  { value: 'MESSAGE_RECEIVED', label: 'Messages' },
  { value: 'SYSTEM_ALERT', label: 'System' },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState<string | undefined>();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({
    unreadOnly: activeTab === 'unread',
    type: selectedType,
  });

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = typeof notification.createdAt === 'string'
      ? new Date(notification.createdAt)
      : notification.createdAt;
    
    let groupKey: string;
    if (isToday(date)) {
      groupKey = 'Today';
    } else if (isYesterday(date)) {
      groupKey = 'Yesterday';
    } else if (isThisWeek(date)) {
      groupKey = 'This Week';
    } else {
      groupKey = format(date, 'MMMM yyyy');
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      setSelectedType(undefined);
    } else if (value === 'unread') {
      setSelectedType(undefined);
    } else {
      setSelectedType(value);
    }
  };

  return (
    <RootLayout>
      <DashboardShell
        title="Notifications"
        description="Manage your notifications and stay updated"
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All as Read
              </Button>
            )}
          </div>
        }
      >
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {notificationTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value}>
                {type.label}
                {type.value === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications"
                description={
                  activeTab === 'unread'
                    ? "You're all caught up! No unread notifications."
                    : 'No notifications to display.'
                }
              />
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedNotifications).map(([groupKey, groupNotifications]) => (
                  <div key={groupKey}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                      {groupKey}
                    </h3>
                    <div className="space-y-2">
                      {groupNotifications.map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          onMarkRead={markAsRead}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </RootLayout>
  );
}

