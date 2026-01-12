'use client';

/**
 * Agency Incidents Page
 * Agency Admin - View agency-specific incidents
 */

import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AgencyIncidentsPage() {
  const { data: session } = useSession();
  const agencyId = session?.user?.agencyId;

  const { data: incidents, isLoading } = trpc.incidents.getAll.useQuery(
    {
      assignedAgencyId: agencyId || undefined,
      page: 1,
      pageSize: 50,
    },
    { enabled: !!agencyId }
  );

  return (
    <RootLayout>
      <DashboardShell
        title="My Agency Incidents"
        description="All incidents assigned to your agency"
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">Loading incidents...</div>
          ) : (
            <div className="space-y-4">
              {incidents?.incidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/dashboard/incidents/${incident.id}`}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <h3 className="font-semibold text-lg">
                              {incident.title}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {incident.region}, {incident.district}
                          </p>
                          <p className="text-sm">{incident.status}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    </RootLayout>
  );
}
