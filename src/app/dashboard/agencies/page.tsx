'use client';

/**
 * Agencies Management Page
 * System Admin only - Manage all agencies
 */

import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

export default function AgenciesPage() {
  const { data: agencies, isLoading } = trpc.agencies.getAll.useQuery();

  return (
    <RootLayout>
      <DashboardShell
        title="Agencies Management"
        description="Manage all emergency response agencies"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">All Agencies</h2>
              <p className="text-muted-foreground">
                Manage and monitor emergency response agencies
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Agency
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading agencies...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agencies?.map((agency) => (
                <Card key={agency.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {agency.name}
                      </CardTitle>
                      <Badge variant="default">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span> {agency.type}
                      </div>
                      <div>
                        <span className="font-medium">Region:</span> {agency.region}
                      </div>
                      <div>
                        <span className="font-medium">District:</span> {agency.district}
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
