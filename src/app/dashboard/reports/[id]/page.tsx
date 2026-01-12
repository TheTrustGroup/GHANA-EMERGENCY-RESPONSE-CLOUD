'use client';

/**
 * Report View Page
 * View generated report
 */

import { useParams, useRouter } from 'next/navigation';
import { Download, Share2, RefreshCw } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { trpc } from '@/lib/trpc/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ReportViewPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const { data: report, isLoading } = trpc.reports.getById.useQuery(
    { id: reportId },
    { enabled: !!reportId }
  );

  const generateMutation = trpc.reports.generate.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/reports/${data.id}`);
    },
  });

  if (isLoading) {
    return (
      <RootLayout>
        <DashboardShell isLoading={true}>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardShell>
      </RootLayout>
    );
  }

  // Type assertion for report data
  const reportData = report as any;

  if (!reportData) {
    return (
      <RootLayout>
        <DashboardShell>
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">Report Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The report you're looking for doesn't exist or has been deleted.
              </p>
              <Button variant="outline" onClick={() => router.push('/dashboard/reports')}>
                Back to Reports
              </Button>
            </CardContent>
          </Card>
        </DashboardShell>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <DashboardShell
        title={reportData?.reportConfig?.name || 'Report'}
        description="View generated report"
        actions={
          <div className="flex gap-2">
            {reportData?.fileUrl && (
              <Button variant="outline" asChild>
                <a href={reportData.fileUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            )}
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (reportData?.reportConfigId) {
                  generateMutation.mutate({ reportConfigId: reportData.reportConfigId });
                }
              }}
              disabled={generateMutation.isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Generated</p>
                  <p className="font-medium">
                    {reportData?.generatedAt
                      ? format(new Date(reportData.generatedAt), 'MMM d, yyyy h:mm a')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date Range</p>
                  <p className="font-medium">
                    {reportData?.dateRangeStart && reportData?.dateRangeEnd
                      ? `${format(new Date(reportData.dateRangeStart), 'MMM d')} - ${format(new Date(reportData.dateRangeEnd), 'MMM d, yyyy')}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      reportData?.status === 'completed'
                        ? 'default'
                        : reportData?.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {reportData?.status || 'unknown'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">File Size</p>
                  <p className="font-medium">
                    {reportData?.fileSize ? `${(reportData.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PDF Viewer */}
          {reportData?.fileUrl ? (
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src={reportData.fileUrl}
                  className="w-full h-[800px] border rounded"
                  title="Report PDF"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Report file is not available. It may still be generating.
                </p>
                {reportData?.status === 'generating' && (
                  <div className="mt-4">
                    <LoadingSpinner size="md" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Generating report...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardShell>
    </RootLayout>
  );
}
