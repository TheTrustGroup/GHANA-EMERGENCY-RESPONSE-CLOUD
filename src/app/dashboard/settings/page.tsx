'use client';

/**
 * Settings/Profile Page
 * User settings and profile management
 */

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Shield, Bell, ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user } = trpc.users.getProfile.useQuery(undefined, {
    enabled: !!session?.user?.id,
  });

  const [name, setName] = useState(user?.name || session?.user?.name || '');
  const [phone, setPhone] = useState((user as any)?.phone || (session?.user as any)?.phone || '');

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const handleSave = () => {
    updateProfile.mutate({
      name,
      phone,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your profile and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-blue-600 text-3xl font-bold text-white">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {session?.user?.name || 'User'}
                </h3>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
                <Badge className="mt-2" variant="outline">
                  {session?.user?.role?.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || session?.user?.name || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.email || 'Not set'}
                </p>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">
                    {(user as any)?.phone || (session?.user as any)?.phone || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Account Status
                </Label>
                <Badge variant={user?.isActive ? 'default' : 'destructive'} className="mt-1">
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex gap-3 border-t pt-4">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user?.name || session?.user?.name || '');
                    setPhone((user as any)?.phone || (session?.user as any)?.phone || '');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/settings/notifications')}
              >
                <Bell className="mr-3 h-4 w-4" />
                Notification Preferences
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/incidents')}
              >
                <MapPin className="mr-3 h-4 w-4" />
                View All Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
