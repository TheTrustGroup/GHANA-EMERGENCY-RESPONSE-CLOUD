'use client';

/**
 * Users Management Page
 * System Admin only - Manage all users
 */

import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { UserRole } from '@prisma/client';

export default function UsersPage() {
  const { data: users, isLoading } = trpc.users.getAll.useQuery();

  const roleColors: Record<UserRole, string> = {
    SYSTEM_ADMIN: 'bg-purple-100 text-purple-800',
    AGENCY_ADMIN: 'bg-blue-100 text-blue-800',
    DISPATCHER: 'bg-orange-100 text-orange-800',
    RESPONDER: 'bg-green-100 text-green-800',
    CITIZEN: 'bg-gray-100 text-gray-800',
  };

  return (
    <RootLayout>
      <DashboardShell
        title="Users Management"
        description="Manage all platform users"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">All Users</h2>
              <p className="text-muted-foreground">
                Manage and monitor platform users
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading users...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users?.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {user.name}
                      </CardTitle>
                      <Badge className={roleColors[user.role]}>
                        {user.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Email:</span> {user.email}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {user.phone}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    </RootLayout>
  );
}
