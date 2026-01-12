'use client';

/**
 * Agency Team Page
 * Agency Admin - Manage team members
 */

import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useSession } from 'next-auth/react';

export default function AgencyTeamPage() {
  const { data: session } = useSession();
  const agencyId = session?.user?.agencyId;

  const { data: team, isLoading } = trpc.users.getByAgency.useQuery(
    { agencyId: agencyId || '' },
    { enabled: !!agencyId }
  );

  return (
    <RootLayout>
      <DashboardShell
        title="My Team"
        description="Manage your agency team members"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Team Members</h2>
              <p className="text-muted-foreground">
                Manage responders and dispatchers in your agency
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading team...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {team?.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {member.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Role:</span>{' '}
                        <Badge>{member.role}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {member.phone}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <Badge variant={member.isActive ? 'default' : 'secondary'}>
                          {member.isActive ? 'Active' : 'Inactive'}
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
