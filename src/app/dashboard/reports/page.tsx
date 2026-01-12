'use client';

/**
 * Reports Management Page
 * Manage scheduled reports and view report history
 */

import { useState } from 'react';
import { Plus, Download, Edit, Trash2, Play, Pause, Calendar, Mail } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { REPORT_TEMPLATES } from '@/types/reports';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('scheduled');

  // Fetch scheduled reports
  const { data: scheduledReports, isLoading: isLoadingScheduled } =
    trpc.reports.getScheduled.useQuery(undefined, {
      refetchInterval: 30000,
    });

  // Fetch report history
  const { data: reportHistory, isLoading: isLoadingHistory } =
    trpc.reports.getHistory.useQuery(
      { limit: 20 },
      { refetchInterval: 60000 }
    );

  return (
    <RootLayout>
      <DashboardShell
        title="Reports"
        description="Manage automated reports and view history"
        actions={
          <Button asChild>
            <Link href="/dashboard/reports/new">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Link>
          </Button>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-4">
            {isLoadingScheduled ? (
              <div>Loading scheduled reports...</div>
            ) : scheduledReports && scheduledReports.length > 0 ? (
              <div className="grid gap-4">
                {scheduledReports.map((report: any) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{report.name}</CardTitle>
                          <CardDescription>{report.description || 'No description'}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={report.isActive ? 'default' : 'secondary'}>
                            {report.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{report.schedule?.frequency || 'once'}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Frequency</p>
                          <p className="font-medium">
                            {report.schedule?.frequency === 'daily' && 'Daily'}
                            {report.schedule?.frequency === 'weekly' && 'Weekly'}
                            {report.schedule?.frequency === 'monthly' && 'Monthly'}
                            {report.schedule?.frequency === 'once' && 'Once'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Recipients</p>
                          <p className="font-medium">{report.recipients?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Run</p>
                          <p className="font-medium">
                            {report.lastRun
                              ? format(new Date(report.lastRun), 'MMM d, yyyy')
                              : 'Never'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Run</p>
                          <p className="font-medium">
                            {report.nextRun
                              ? format(new Date(report.nextRun), 'MMM d, yyyy HH:mm')
                              : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/reports/${report.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Run Now
                        </Button>
                        <Button variant="outline" size="sm">
                          {report.isActive ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Enable
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a new report to get started with automated reporting.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/reports/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Report
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {REPORT_TEMPLATES.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="mb-4">
                      {template.category}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.defaultSections.length} sections included
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/reports/new?template=${template.id}`}>
                        Use Template
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {isLoadingHistory ? (
              <div>Loading report history...</div>
            ) : reportHistory && reportHistory.length > 0 ? (
              <div className="space-y-4">
                {reportHistory.map((report: any) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{report.reportConfig?.name || 'Report'}</CardTitle>
                          <CardDescription>
                            Generated {format(new Date(report.generatedAt), 'MMM d, yyyy at h:mm a')}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            report.status === 'completed'
                              ? 'default'
                              : report.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {report.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date Range</p>
                          <p className="font-medium">
                            {report.dateRangeStart && report.dateRangeEnd
                              ? `${format(new Date(report.dateRangeStart), 'MMM d')} - ${format(new Date(report.dateRangeEnd), 'MMM d, yyyy')}`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">File Size</p>
                          <p className="font-medium">
                            {report.fileSize ? `${(report.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pages</p>
                          <p className="font-medium">{report.pageCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data Points</p>
                          <p className="font-medium">
                            {report.metadata?.dataPoints || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/reports/${report.id}`}>
                            <Download className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        {report.fileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={report.fileUrl} download>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Report History</h3>
                  <p className="text-muted-foreground">
                    Generated reports will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </RootLayout>
  );
}

