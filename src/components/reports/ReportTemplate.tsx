'use client';

/**
 * Report Template Component
 * Renders report for PDF generation
 */

import { ReportConfig } from '@/types/reports';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ReportTemplateProps {
  config: ReportConfig;
  sections: Array<{ type: string; content: any }>;
  dateRange: { start: Date; end: Date };
}

export function ReportTemplate({
  config,
  sections,
  dateRange,
}: ReportTemplateProps) {
  return (
    <div className="report-template bg-white p-8" style={{ minHeight: '11in', width: '8.5in' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{config.name}</h1>
            {config.description && (
              <p className="text-gray-600 mt-2">{config.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Ghana Emergency Response Platform</div>
            <div className="text-xs text-gray-400 mt-1">
              {format(new Date(), 'MMMM d, yyyy')}
            </div>
          </div>
        </div>
        <Separator />
      </div>

      {/* Date Range and Filters */}
      <div className="mb-6 text-sm text-gray-600">
        <p>
          <strong>Period:</strong> {format(dateRange.start, 'MMM d, yyyy')} -{' '}
          {format(dateRange.end, 'MMM d, yyyy')}
        </p>
        {config.filters && (
          <div className="mt-2">
            {config.filters.severity && config.filters.severity.length > 0 && (
              <span className="mr-4">
                <strong>Severity:</strong> {config.filters.severity.join(', ')}
              </span>
            )}
            {config.filters.region && config.filters.region.length > 0 && (
              <span className="mr-4">
                <strong>Region:</strong> {config.filters.region.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table of Contents */}
      {sections.length > 3 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {sections.map((section, index) => (
              <li key={index}>
                <a href={`#section-${index}`} className="text-blue-600 hover:underline">
                  {section.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </a>
              </li>
            ))}
          </ul>
          <Separator className="mt-4" />
        </div>
      )}

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index} id={`section-${index}`} className="page-break-inside-avoid">
            {renderSection(section)}
            {index < sections.length - 1 && <Separator className="my-8" />}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t text-xs text-gray-500 text-center">
        <p>
          Generated on {format(new Date(), 'MMMM d, yyyy at h:mm a')} | Page{' '}
          <span className="page-number">1</span>
        </p>
        <p className="mt-1">Ghana Emergency Response Platform - Confidential</p>
      </div>
    </div>
  );
}

/**
 * Render individual section
 */
function renderSection(section: { type: string; content: any }): React.ReactNode {
  switch (section.type) {
    case 'executive_summary':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold">{section.content.totalIncidents || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{section.content.resolved || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">
                  {section.content.avgResponseTime || 0} min
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical Incidents</p>
                <p className="text-2xl font-bold text-red-600">
                  {section.content.critical || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case 'key_metrics':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(section.content).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xl font-semibold">{String(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    case 'incident_list':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Incident List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Severity</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {section.content.slice(0, 20).map((incident: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{incident.title}</td>
                      <td className="p-2">{incident.severity}</td>
                      <td className="p-2">{incident.status}</td>
                      <td className="p-2">
                        {format(new Date(incident.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      );

    case 'recommendations':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              {section.content.map((rec: string, idx: number) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );

    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>{section.type.replace(/_/g, ' ')}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs">{JSON.stringify(section.content, null, 2)}</pre>
          </CardContent>
        </Card>
      );
  }
}

