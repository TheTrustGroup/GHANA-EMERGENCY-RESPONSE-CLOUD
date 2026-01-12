'use client';

/**
 * My Dispatches Page
 * Dispatcher - View dispatches created by current dispatcher
 */

import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MyDispatchesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { data: dispatches, isLoading } = trpc.dispatch.getAllActive.useQuery(
    undefined,
    { enabled: !!userId }
  );

  return (
    <RootLayout>
      <DashboardShell
        title="My Dispatches"
        description="Dispatches you've created"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Active Dispatches</h2>
            <p className="text-muted-foreground">
              {dispatches?.length || 0} active dispatch assignments
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading dispatches...</div>
          ) : (
            <div className="space-y-4">
              {dispatches?.map((dispatch) => (
                <Link
                  key={dispatch.id}
                  href={`/dashboard/dispatch/active`}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        {(dispatch as any).incident?.title || 'Dispatch Assignment'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">Status:</span>
                        <span>{dispatch.status}</span>
                        <span className="font-medium">Agency:</span>
                        <span>{(dispatch as any).agency?.name || 'N/A'}</span>
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
