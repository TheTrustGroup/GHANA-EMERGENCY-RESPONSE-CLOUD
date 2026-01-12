'use client';

/**
 * Available Incidents Page
 * Responder - View available incidents to accept
 */

import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { IncidentStatus } from '@prisma/client';
import Link from 'next/link';

export default function AvailableIncidentsPage() {
  const { data: incidents, isLoading } = trpc.incidents.getAll.useQuery({
    status: IncidentStatus.REPORTED,
    page: 1,
    pageSize: 50,
    sortBy: 'severity',
    sortOrder: 'desc',
  });

  return (
    <RootLayout>
      <DashboardShell
        title="Available Incidents"
        description="Incidents you can respond to"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Available Incidents</h2>
            <p className="text-muted-foreground">
              {incidents?.incidents.length || 0} incidents available for response
            </p>
          </div>

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
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        {incident.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">Severity:</span>
                        <span>{incident.severity}</span>
                        <span className="font-medium">Location:</span>
                        <span>{incident.region}, {incident.district}</span>
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
