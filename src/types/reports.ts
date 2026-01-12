/**
 * Report Type Definitions
 */

import { IncidentSeverity, IncidentStatus } from '@prisma/client';

export type ReportFrequency = 'once' | 'daily' | 'weekly' | 'monthly';

export type ReportDeliveryMethod = 'email' | 'dashboard' | 'both';

export type ReportSectionType =
  | 'text'
  | 'metric'
  | 'chart'
  | 'table'
  | 'map'
  | 'image'
  | 'executive_summary'
  | 'key_metrics'
  | 'incident_list'
  | 'agency_performance'
  | 'recommendations';

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area';

export interface DateRangeConfig {
  type: 'fixed' | 'rolling';
  fixed?: {
    startDate: Date;
    endDate: Date;
  };
  rolling?: {
    period: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_month' | 'last_quarter';
  };
}

export interface ReportFilters {
  severity?: IncidentSeverity[];
  category?: string[];
  region?: string[];
  district?: string[];
  agencyId?: string[];
  status?: IncidentStatus[];
}

export interface ReportSection {
  id: string;
  type: ReportSectionType;
  title?: string;
  config?: {
    // Chart-specific
    chartType?: ChartType;
    dataKey?: string;
    // Table-specific
    columns?: string[];
    // Text-specific
    content?: string;
    // Metric-specific
    metricKey?: string;
  };
  order: number;
}

export interface ScheduleConfig {
  frequency: ReportFrequency;
  time: string; // HH:mm format
  timezone: string; // IANA timezone
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
  enabled: boolean;
}

export interface ReportRecipient {
  type: 'email' | 'role';
  value: string; // Email address or UserRole
}

export interface ReportConfig {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  dateRange: DateRangeConfig;
  filters?: ReportFilters;
  sections: ReportSection[];
  schedule: ScheduleConfig;
  recipients: ReportRecipient[];
  deliveryMethod: ReportDeliveryMethod;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'operations' | 'executive' | 'performance' | 'analysis' | 'custom';
  defaultSections: ReportSection[];
  defaultFilters?: ReportFilters;
  defaultSchedule?: Partial<ScheduleConfig>;
  icon?: string;
}

export interface GeneratedReport {
  id: string;
  reportConfigId: string;
  generatedAt: Date;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters?: ReportFilters;
  fileUrl: string; // S3 URL
  fileSize: number; // bytes
  pageCount: number;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
  metadata: {
    dataPoints: number;
    generationTime: number; // milliseconds
  };
}

export interface ReportExecution {
  id: string;
  reportConfigId: string;
  scheduledAt: Date;
  executedAt?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  generatedReportId?: string;
  error?: string;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'daily-operations',
    name: 'Daily Operations Report',
    description: 'Yesterday\'s incidents summary and current status',
    category: 'operations',
    defaultSections: [
      { id: 'exec-summary', type: 'executive_summary', order: 1 },
      { id: 'metrics', type: 'key_metrics', order: 2 },
      { id: 'critical-incidents', type: 'incident_list', order: 3, config: { metricKey: 'critical' } },
      { id: 'response-times', type: 'chart', order: 4, config: { chartType: 'line' } },
    ],
    defaultSchedule: {
      frequency: 'daily',
      time: '08:00',
      timezone: 'Africa/Accra',
    },
  },
  {
    id: 'weekly-executive',
    name: 'Weekly Executive Summary',
    description: 'Week overview with trends and recommendations',
    category: 'executive',
    defaultSections: [
      { id: 'exec-summary', type: 'executive_summary', order: 1 },
      { id: 'metrics', type: 'key_metrics', order: 2 },
      { id: 'trends', type: 'chart', order: 3, config: { chartType: 'line' } },
      { id: 'top-incidents', type: 'incident_list', order: 4 },
      { id: 'agency-rankings', type: 'agency_performance', order: 5 },
      { id: 'recommendations', type: 'recommendations', order: 6 },
    ],
    defaultSchedule: {
      frequency: 'weekly',
      time: '09:00',
      timezone: 'Africa/Accra',
      dayOfWeek: 1, // Monday
    },
  },
  {
    id: 'monthly-performance',
    name: 'Monthly Performance Review',
    description: 'Comprehensive monthly metrics and analysis',
    category: 'performance',
    defaultSections: [
      { id: 'exec-summary', type: 'executive_summary', order: 1 },
      { id: 'metrics', type: 'key_metrics', order: 2 },
      { id: 'comparisons', type: 'chart', order: 3, config: { chartType: 'bar' } },
      { id: 'agency-performance', type: 'agency_performance', order: 4 },
      { id: 'geographic', type: 'map', order: 5 },
      { id: 'responder-metrics', type: 'table', order: 6 },
      { id: 'recommendations', type: 'recommendations', order: 7 },
    ],
    defaultSchedule: {
      frequency: 'monthly',
      time: '09:00',
      timezone: 'Africa/Accra',
      dayOfMonth: 1,
    },
  },
  {
    id: 'agency-performance',
    name: 'Agency Performance Report',
    description: 'Agency-specific metrics and analysis',
    category: 'performance',
    defaultSections: [
      { id: 'metrics', type: 'key_metrics', order: 1 },
      { id: 'comparison', type: 'chart', order: 2, config: { chartType: 'bar' } },
      { id: 'incident-breakdown', type: 'chart', order: 3, config: { chartType: 'pie' } },
      { id: 'response-analysis', type: 'chart', order: 4, config: { chartType: 'line' } },
      { id: 'responder-performance', type: 'table', order: 5 },
    ],
  },
  {
    id: 'incident-analysis',
    name: 'Incident Analysis Report',
    description: 'Detailed incident analysis and trends',
    category: 'analysis',
    defaultSections: [
      { id: 'summary', type: 'executive_summary', order: 1 },
      { id: 'by-severity', type: 'chart', order: 2, config: { chartType: 'pie' } },
      { id: 'by-category', type: 'chart', order: 3, config: { chartType: 'bar' } },
      { id: 'by-region', type: 'map', order: 4 },
      { id: 'temporal', type: 'chart', order: 5, config: { chartType: 'line' } },
      { id: 'incident-list', type: 'incident_list', order: 6 },
    ],
  },
];

