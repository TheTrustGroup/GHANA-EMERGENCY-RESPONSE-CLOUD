'use client';

/**
 * Audit Logs Page
 * System Admin only - View system audit logs
 */

import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const { data: logs, isLoading } = trpc.audit.search.useQuery({
    page: 1,
    pageSize: 100,
  });

  return (
    <RootLayout>
      <DashboardShell
        title="Audit Logs"
        description="System activity and audit trail"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">System Audit Logs</h2>
            <p className="text-muted-foreground">
              Complete activity log of all system actions
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading audit logs...</div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logs?.logs?.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{log.action}</span>
                          <span className="text-sm text-muted-foreground">
                            on {log.entity}
                          </span>
                        </div>
                        {log.changes && (
                          <p className="text-sm text-muted-foreground">
                            Changes: {JSON.stringify(log.changes)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          User: {log.user?.name || 'System'} •{' '}
                          {format(new Date(log.createdAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </RootLayout>
  );
}
