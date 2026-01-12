/**
 * Report Scheduler
 * Handles scheduled report generation
 */

import { prisma } from '@/server/db';
import { ReportConfig, ScheduleConfig } from '@/types/reports';
import { generateReport } from './generator';

/**
 * Check and execute scheduled reports
 * Should be called periodically (e.g., every hour via cron)
 */
export async function checkScheduledReports(): Promise<void> {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();
  const currentDate = now.getDate();

  // Find active report configurations
  // Note: This assumes a report_configs table exists. In production, create proper Prisma models.
  const activeReports = await prisma.$queryRaw`
    SELECT * FROM report_configs 
    WHERE is_active = true AND schedule_enabled = true
  ` as any[];

  for (const reportConfig of activeReports) {
    const schedule = reportConfig.schedule as ScheduleConfig;

    if (!schedule.enabled) continue;

    // Check if it's time to run
    const shouldRun = checkScheduleMatch(schedule, {
      hour: currentHour,
      minute: currentMinute,
      dayOfWeek: currentDay,
      dayOfMonth: currentDate,
    });

    if (shouldRun) {
      // Check if already executed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check existing execution (would use proper Prisma model in production)
      const existingExecution = await prisma.$queryRaw`
        SELECT * FROM report_executions 
        WHERE report_config_id = ${reportConfig.id}
        AND scheduled_at >= ${today}
        AND status IN ('completed', 'running')
        LIMIT 1
      ` as any[];

      if (!existingExecution) {
        // Create execution record (would use proper Prisma model in production)
        const execution = {
          id: `exec_${Date.now()}`,
          reportConfigId: reportConfig.id,
          scheduledAt: now,
          status: 'pending',
        } as any;

        // Queue for execution (async)
        executeReport(reportConfig, execution.id).catch((error) => {
          console.error(`Failed to execute report ${reportConfig.id}:`, error);
        });
      }
    }
  }
}

/**
 * Check if current time matches schedule
 */
function checkScheduleMatch(
  schedule: ScheduleConfig,
  current: {
    hour: number;
    minute: number;
    dayOfWeek: number;
    dayOfMonth: number;
  }
): boolean {
  const [scheduleHour, scheduleMinute] = schedule.time.split(':').map(Number);

  // Check time
  if (current.hour !== scheduleHour || current.minute !== scheduleMinute) {
    return false;
  }

  // Check frequency-specific conditions
  switch (schedule.frequency) {
    case 'daily':
      return true;

    case 'weekly':
      return schedule.dayOfWeek === current.dayOfWeek;

    case 'monthly':
      return schedule.dayOfMonth === current.dayOfMonth;

    case 'once':
      return false; // One-time reports are handled separately

    default:
      return false;
  }
}

/**
 * Execute report generation
 */
async function executeReport(reportConfig: ReportConfig, _executionId: string): Promise<void> {
  try {
    // Update execution status (would use proper Prisma model in production)
    // await prisma.reportExecution.update({ ... });

    // Generate report
    const generatedReport = await generateReport(reportConfig, reportConfig.createdBy);

    // Update execution with result (would use proper Prisma model in production)
    // await prisma.reportExecution.update({ ... });

    // Send notifications
    await sendReportNotifications(reportConfig, generatedReport);
  } catch (error) {
    console.error(`Report execution failed for ${reportConfig.id}:`, error);

    // Update execution with error (would use proper Prisma model in production)
    // await prisma.reportExecution.update({ ... });
  }
}

/**
 * Send notifications to recipients
 */
async function sendReportNotifications(
  reportConfig: ReportConfig,
  generatedReport: any
): Promise<void> {
  // This would integrate with the email service
  // For now, just log
  console.log(`Sending report ${generatedReport.id} to recipients of config ${reportConfig.id}`);
}

/**
 * Convert timezone-aware time to UTC
 */
export function convertToUTC(
  _time: string,
  _timezone: string,
  date: Date = new Date()
): Date {
  // This would use a library like date-fns-tz
  // For now, return the date as-is (would need proper timezone conversion)
  return date;
}

