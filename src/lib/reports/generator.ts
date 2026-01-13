/**
 * Report Generator
 * Generates PDF reports from configurations
 */

import { prisma } from '@/server/db';
import { ReportConfig, GeneratedReport, ReportSection } from '@/types/reports';
// import { exportToPDF } from '@/lib/exports'; // Would be used for PDF generation
import { calculateResponseTime } from '@/lib/analytics';
import { IncidentStatus } from '@prisma/client';

interface ReportData {
  incidents: any[];
  metrics: {
    total: number;
    resolved: number;
    avgResponseTime: number;
    critical: number;
  };
  agencies: any[];
  responders: any[];
}

/**
 * Generate report based on configuration
 */
export async function generateReport(
  config: ReportConfig,
  userId: string
): Promise<GeneratedReport> {
  const startTime = Date.now();

  try {
    // 1. Calculate date range
    const dateRange = calculateDateRange(config.dateRange);
    
    // 2. Build filters
    const where: any = {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    };

    if (config.filters) {
      if (config.filters.severity?.length) {
        where.severity = { in: config.filters.severity };
      }
      if (config.filters.category?.length) {
        where.category = { in: config.filters.category };
      }
      if (config.filters.region?.length) {
        where.region = { in: config.filters.region };
      }
      if (config.filters.district?.length) {
        where.district = { in: config.filters.district };
      }
      if (config.filters.agencyId?.length) {
        where.assignedAgencyId = { in: config.filters.agencyId };
      }
      if (config.filters.status?.length) {
        where.status = { in: config.filters.status };
      }
    }

    // 3. Fetch data
    const [incidents, agencies, responders] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          reportedBy: { select: { name: true, email: true } },
          assignedAgency: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 1000, // Limit for performance
      }),
      prisma.agencies.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          type: true,
        },
      }),
      prisma.users.findMany({
        where: {
          role: 'RESPONDER',
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          agencyId: true,
        },
      }),
    ]);

    // 4. Calculate metrics
    const resolvedIncidents = incidents.filter(
      (inc) => inc.status === IncidentStatus.RESOLVED || inc.status === IncidentStatus.CLOSED
    );
    
    const responseTimes = resolvedIncidents
      .map((inc) => calculateResponseTime(inc))
      .filter((time): time is number => time !== null);

    const metrics = {
      total: incidents.length,
      resolved: resolvedIncidents.length,
      avgResponseTime:
        responseTimes.length > 0
          ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
          : 0,
      critical: incidents.filter((inc) => inc.severity === 'CRITICAL').length,
    };

    const reportData: ReportData = {
      incidents,
      metrics,
      agencies,
      responders,
    };

    // 5. Generate sections
    const sections = await generateSections(config.sections, reportData);

    // 6. Generate PDF (would use formatReportForPDF in production)
    // const pdfData = formatReportForPDF(config, reportData, sections, dateRange);
    
    // 7. Save to database
    // Note: In production, you'd create proper Prisma models for reports
    // For now, return a mock structure
    const generatedReport = {
      id: `report_${Date.now()}`,
      reportConfigId: config.id,
      generatedAt: new Date(),
      dateRangeStart: dateRange.start,
      dateRangeEnd: dateRange.end,
      fileUrl: '', // Will be set after S3 upload
      fileSize: 0,
      pageCount: sections.length,
      status: 'completed' as const,
      metadata: {
        dataPoints: incidents.length,
        generationTime: Date.now() - startTime,
      },
      generatedBy: userId,
    };

    // 8. Upload to S3 (placeholder)
    // const s3Url = await uploadReportToS3(pdfData, generatedReport.id);
    // await prisma.generatedReport.update({
    //   where: { id: generatedReport.id },
    //   data: { fileUrl: s3Url },
    // });

    return {
      id: generatedReport.id,
      reportConfigId: config.id,
      generatedAt: generatedReport.generatedAt,
      dateRange: {
        start: dateRange.start,
        end: dateRange.end,
      },
      filters: config.filters,
      fileUrl: generatedReport.fileUrl,
      fileSize: generatedReport.fileSize,
      pageCount: generatedReport.pageCount,
      status: generatedReport.status as 'generating' | 'completed' | 'failed',
      metadata: {
        dataPoints: incidents.length,
        generationTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
}

/**
 * Calculate date range from config
 */
function calculateDateRange(dateRangeConfig: ReportConfig['dateRange']): {
  start: Date;
  end: Date;
} {
  if (dateRangeConfig.type === 'fixed' && dateRangeConfig.fixed) {
    return {
      start: dateRangeConfig.fixed.startDate,
      end: dateRangeConfig.fixed.endDate,
    };
  }

  if (dateRangeConfig.type === 'rolling' && dateRangeConfig.rolling) {
    const end = new Date();
    const start = new Date();

    switch (dateRangeConfig.rolling.period) {
      case 'last_7_days':
        start.setDate(end.getDate() - 7);
        break;
      case 'last_30_days':
        start.setDate(end.getDate() - 30);
        break;
      case 'last_90_days':
        start.setDate(end.getDate() - 90);
        break;
      case 'last_month':
        start.setMonth(end.getMonth() - 1);
        start.setDate(1);
        end.setDate(0); // Last day of previous month
        break;
      case 'last_quarter':
        start.setMonth(end.getMonth() - 3);
        start.setDate(1);
        break;
    }

    return { start, end };
  }

  // Default: last 30 days
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return { start, end };
}

/**
 * Generate sections based on config
 */
async function generateSections(
  sections: ReportSection[],
  data: ReportData
): Promise<Array<{ type: string; content: any }>> {
  const generated: Array<{ type: string; content: any }> = [];

  for (const section of sections.sort((a, b) => a.order - b.order)) {
    switch (section.type) {
      case 'executive_summary':
        generated.push({
          type: 'executive_summary',
          content: {
            totalIncidents: data.metrics.total,
            resolved: data.metrics.resolved,
            avgResponseTime: data.metrics.avgResponseTime,
            critical: data.metrics.critical,
          },
        });
        break;

      case 'key_metrics':
        generated.push({
          type: 'key_metrics',
          content: data.metrics,
        });
        break;

      case 'incident_list':
        generated.push({
          type: 'incident_list',
          content: data.incidents.slice(0, 50), // Limit for PDF
        });
        break;

      case 'agency_performance':
        generated.push({
          type: 'agency_performance',
          content: data.agencies,
        });
        break;

      case 'chart':
        generated.push({
          type: 'chart',
          content: {
            chartType: section.config?.chartType || 'bar',
            data: generateChartData(section, data),
          },
        });
        break;

      case 'recommendations':
        generated.push({
          type: 'recommendations',
          content: generateRecommendations(data),
        });
        break;

      default:
        break;
    }
  }

  return generated;
}

/**
 * Generate chart data for a section
 */
function generateChartData(_section: ReportSection, _data: ReportData): any[] {
  // This would generate appropriate chart data based on section config
  // For now, return sample data structure
  return [];
}

/**
 * Generate recommendations based on data
 */
function generateRecommendations(data: ReportData): string[] {
  const recommendations: string[] = [];

  if (data.metrics.avgResponseTime > 60) {
    recommendations.push('Response times are above target. Consider increasing responder capacity.');
  }

  if (data.metrics.critical > data.metrics.total * 0.2) {
    recommendations.push('High percentage of critical incidents. Review emergency protocols.');
  }

  if (data.metrics.resolved / data.metrics.total < 0.8) {
    recommendations.push('Resolution rate below target. Investigate bottlenecks in incident resolution.');
  }

  return recommendations;
}

/**
 * Format report data for PDF generation
 * Note: This function is currently unused but would be used for PDF generation
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatReportForPDF(
  config: ReportConfig,
  _data: ReportData,
  sections: Array<{ type: string; content: any }>,
  dateRange: { start: Date; end: Date }
): any[] {
  // Format data for PDF export
  const pdfRows: any[] = [];

  // Header
  pdfRows.push({ _section: 'header', title: config.name, dateRange: `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}` });

  // Sections
  sections.forEach((section) => {
    pdfRows.push({ _section: section.type, ...section.content });
  });

  return pdfRows;
}

