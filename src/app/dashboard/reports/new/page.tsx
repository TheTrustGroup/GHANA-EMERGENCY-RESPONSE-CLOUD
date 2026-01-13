'use client';

/**
 * New Report Wizard
 * Step-by-step report configuration
 */

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { RootLayout } from '@/components/layout';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker, type DateRange } from '@/components/analytics/DateRangePicker';
import { trpc } from '@/lib/trpc/client';
import { REPORT_TEMPLATES } from '@/types/reports';
import { useToast } from '@/hooks/use-toast';
import { subDays } from 'date-fns';

const STEPS = [
  { id: 'template', title: 'Select Template' },
  { id: 'data', title: 'Configure Data' },
  { id: 'schedule', title: 'Schedule' },
  { id: 'recipients', title: 'Recipients' },
  { id: 'preview', title: 'Preview & Save' },
];

function NewReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    searchParams.get('template') || null
  );

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [dateRangeType, setDateRangeType] = useState<'fixed' | 'rolling'>('rolling');
  const [rollingPeriod, setRollingPeriod] = useState('last_30_days');
  const [filters] = useState({
    severity: [] as string[],
    category: [] as string[],
    region: [] as string[],
  });
  const [sections, setSections] = useState<string[]>(['executive_summary', 'key_metrics']);
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [timezone, setTimezone] = useState('Africa/Accra');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'dashboard' | 'both'>('both');

  const createReportMutation = trpc.reports.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Report created',
        description: 'Your report has been scheduled successfully.',
      });
      router.push('/dashboard/reports');
    },
    onError: (error) => {
      toast({
        title: 'Failed to create report',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const emailList = recipientEmails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    createReportMutation.mutate({
      name,
      description,
      templateId: selectedTemplate || undefined,
      dateRange: {
        type: dateRangeType,
        ...(dateRangeType === 'fixed'
          ? { fixed: { startDate: dateRange.from, endDate: dateRange.to } }
          : { rolling: { period: rollingPeriod as any } }),
      },
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sections: sections.map((section, index) => ({
        id: section,
        type: section,
        order: index + 1,
      })),
      schedule: {
        frequency,
        time: scheduleTime,
        timezone,
        enabled: frequency !== 'once',
      },
      recipients: [
        ...emailList.map((email) => ({ type: 'email' as const, value: email })),
      ],
      deliveryMethod,
    });
  };

  const template = selectedTemplate
    ? REPORT_TEMPLATES.find((t) => t.id === selectedTemplate)
    : null;

  return (
    <RootLayout>
      <DashboardShell
        title="Create New Report"
        description="Configure and schedule automated reports"
      >
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : index < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label>Select Template</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a template or start with a custom report
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {REPORT_TEMPLATES.map((t) => (
                    <Card
                      key={t.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate === t.id
                          ? 'border-blue-600 border-2'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTemplate(t.id)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{t.name}</CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline">{t.category}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedTemplate === null
                        ? 'border-blue-600 border-2'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTemplate(null)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">Custom Report</CardTitle>
                      <CardDescription>Build your own report from scratch</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label>Report Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Report"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this report"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Date Range</Label>
                  <div className="mt-2 space-y-4">
                    <Select value={dateRangeType} onValueChange={(v: any) => setDateRangeType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Date Range</SelectItem>
                        <SelectItem value="rolling">Rolling Period</SelectItem>
                      </SelectContent>
                    </Select>
                    {dateRangeType === 'fixed' ? (
                      <DateRangePicker value={dateRange} onChange={setDateRange} />
                    ) : (
                      <Select value={rollingPeriod} onValueChange={setRollingPeriod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                          <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                          <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                          <SelectItem value="last_month">Last Month</SelectItem>
                          <SelectItem value="last_quarter">Last Quarter</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Sections to Include</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { id: 'executive_summary', label: 'Executive Summary' },
                      { id: 'key_metrics', label: 'Key Metrics' },
                      { id: 'charts', label: 'Charts and Graphs' },
                      { id: 'incident_list', label: 'Incident List' },
                      { id: 'agency_performance', label: 'Agency Performance' },
                      { id: 'recommendations', label: 'Recommendations' },
                    ].map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={section.id}
                          checked={sections.includes(section.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSections([...sections, section.id]);
                            } else {
                              setSections(sections.filter((s) => s !== section.id));
                            }
                          }}
                        />
                        <Label htmlFor={section.id} className="cursor-pointer">
                          {section.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {frequency !== 'once' && (
                  <>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label>Email Recipients</Label>
                  <Textarea
                    value={recipientEmails}
                    onChange={(e) => setRecipientEmails(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter email addresses separated by commas
                  </p>
                </div>
                <div>
                  <Label>Delivery Method</Label>
                  <Select
                    value={deliveryMethod}
                    onValueChange={(v: any) => setDeliveryMethod(v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="dashboard">Dashboard Only</SelectItem>
                      <SelectItem value="both">Both Email and Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-4">Report Preview</h3>
                  <Card>
                    <CardHeader>
                      <CardTitle>{name || 'Untitled Report'}</CardTitle>
                      <CardDescription>{description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Template:</strong>{' '}
                          {template?.name || 'Custom Report'}
                        </p>
                        <p>
                          <strong>Frequency:</strong> {frequency}
                        </p>
                        <p>
                          <strong>Recipients:</strong>{' '}
                          {recipientEmails.split(',').filter((e) => e.trim()).length} email(s)
                        </p>
                        <p>
                          <strong>Delivery:</strong> {deliveryMethod}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!name || createReportMutation.isLoading}
                  className="w-full"
                >
                  {createReportMutation.isLoading ? 'Saving...' : 'Save and Schedule Report'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          {currentStep < STEPS.length - 1 && (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </DashboardShell>
    </RootLayout>
  );
}

export default function NewReportPage() {
  return (
    <Suspense fallback={
      <RootLayout>
        <DashboardShell>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </DashboardShell>
      </RootLayout>
    }>
      <NewReportContent />
    </Suspense>
  );
}
