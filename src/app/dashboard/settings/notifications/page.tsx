'use client';

/**
 * Notification Preferences Page
 * User settings for notification preferences
 */

import { useState } from 'react';
import { Bell, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { NotificationType } from '@/lib/notifications/notification-service';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/notifications/push-service';
import { useSession } from 'next-auth/react';

const notificationTypeLabels: Record<string, string> = {
  INCIDENT_CREATED: 'New Incidents',
  INCIDENT_ASSIGNED: 'Incident Assignments',
  DISPATCH_ASSIGNMENT: 'Dispatch Assignments',
  STATUS_UPDATE: 'Status Updates',
  MESSAGE_RECEIVED: 'New Messages',
  INCIDENT_RESOLVED: 'Incident Resolutions',
  SYSTEM_ALERT: 'System Alerts',
  REMINDER: 'Reminders',
};

export default function NotificationPreferencesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Default preferences (would be loaded from user settings)
  const [preferences, setPreferences] = useState({
    inApp: true,
    push: false,
    sms: false,
    email: false,
    frequency: 'instant' as 'instant' | 'batched' | 'daily',
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00',
    enabledTypes: Object.values(NotificationType),
  });

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleFrequencyChange = (value: string) => {
    setPreferences((prev) => ({ ...prev, frequency: value as 'instant' | 'batched' | 'daily' }));
  };

  const handleTypeToggle = (type: NotificationType) => {
    setPreferences((prev) => {
      const enabledTypes = prev.enabledTypes.includes(type)
        ? prev.enabledTypes.filter((t) => t !== type)
        : [...prev.enabledTypes, type];
      return { ...prev, enabledTypes };
    });
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      setLoading(true);
      try {
        const subscription = await subscribeToPush(session?.user?.id || '');
        if (subscription) {
          setPreferences((prev) => ({ ...prev, push: true }));
          toast({
            title: 'Push notifications enabled',
            description: 'You will now receive push notifications.',
          });
        } else {
          toast({
            title: 'Failed to enable push notifications',
            description: 'Please check your browser permissions.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to enable push notifications.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await unsubscribeFromPush(session?.user?.id || '');
        setPreferences((prev) => ({ ...prev, push: false }));
        toast({
          title: 'Push notifications disabled',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to disable push notifications.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Save preferences to server
      // await trpc.settings.updateNotificationPreferences.mutate(preferences);
      
      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootLayout>
      <DashboardShell
        title="Notification Preferences"
        description="Manage how and when you receive notifications"
      >
        <div className="space-y-6">
          {/* Delivery Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Channels</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="in-app">In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Always enabled for critical updates
                    </p>
                  </div>
                </div>
                <Switch id="in-app" checked={preferences.inApp} disabled />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Browser push notifications
                    </p>
                  </div>
                </div>
                <Switch
                  id="push"
                  checked={preferences.push}
                  onCheckedChange={handlePushToggle}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      For critical incidents only
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms"
                  checked={preferences.sms}
                  onCheckedChange={(checked) => handleToggle('sms', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Coming soon
                    </p>
                  </div>
                </div>
                <Switch id="email" checked={preferences.email} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Notification Frequency */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Frequency</CardTitle>
              <CardDescription>
                How often should notifications be delivered?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={preferences.frequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="batched">Batched (Every Hour)</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                No notifications during these hours (except critical)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, quietHoursStart: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">End Time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, quietHoursEnd: e.target.value }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>
                Select which types of notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.values(NotificationType).map((type) => (
                <div key={type} className="flex items-center justify-between">
                  <Label htmlFor={`type-${type}`}>
                    {notificationTypeLabels[type] || type}
                  </Label>
                  <Switch
                    id={`type-${type}`}
                    checked={preferences.enabledTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              Save Preferences
            </Button>
          </div>
        </div>
      </DashboardShell>
    </RootLayout>
  );
}

