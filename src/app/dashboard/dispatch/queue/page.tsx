'use client';

/**
 * Dispatch Queue Page
 * Dispatcher - View and manage dispatch queue
 */

import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { IncidentStatus } from '@prisma/client';
import Link from 'next/link';

export default function DispatchQueuePage() {
  const { data: incidents, isLoading } = trpc.incidents.getAll.useQuery({
    status: IncidentStatus.REPORTED,
    page: 1,
    pageSize: 100,
    sortBy: 'severity',
    sortOrder: 'desc',
  });

  return (
    <RootLayout>
      <DashboardShell
        title="Dispatch Queue"
        description="Pending incidents awaiting assignment"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Queue</h2>
            <p className="text-muted-foreground">
              {incidents?.incidents.length || 0} incidents waiting for assignment
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading queue...</div>
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
                        <Radio className="h-5 w-5" />
                        {incident.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">Severity:</span>
                        <span>{incident.severity}</span>
                        <span className="font-medium">Category:</span>
                        <span>{incident.category}</span>
                        <span className="font-medium">Location:</span>
                        <span>{incident.region}</span>
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
