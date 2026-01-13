/**
 * Email Service for Reports
 * Handles email delivery of reports
 */

import { ReportConfig, GeneratedReport } from '@/types/reports';
import { prisma } from '@/server/db';

/**
 * Send report via email
 */
export async function sendReportEmail(
  reportConfig: ReportConfig,
  generatedReport: GeneratedReport
): Promise<void> {
  const recipients = await getRecipients(reportConfig);

  for (const recipient of recipients) {
    try {
      await sendEmail({
        to: recipient.email,
        subject: `[Ghana Emergency Platform] ${reportConfig.name} - ${formatDateRange(generatedReport.dateRange)}`,
        body: generateEmailBody(reportConfig, generatedReport),
        attachment: {
          filename: `${reportConfig.name.replace(/\s+/g, '_')}_${formatDate(generatedReport.generatedAt)}.pdf`,
          url: generatedReport.fileUrl,
        },
      });

      // Track delivery (would use proper Prisma model in production)
      // await prisma.reportDelivery.create({ ... });
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);

      // Track failure (would use proper Prisma model in production)
      // await prisma.reportDelivery.create({ ... });
    }
  }
}

/**
 * Get list of recipient email addresses
 */
async function getRecipients(
  reportConfig: ReportConfig
): Promise<Array<{ email: string; name?: string }>> {
  const recipients: Array<{ email: string; name?: string }> = [];

  for (const recipient of reportConfig.recipients) {
    if (recipient.type === 'email') {
      recipients.push({ email: recipient.value });
    } else if (recipient.type === 'role') {
      // Get all users with this role
      const users = await prisma.users.findMany({
        where: {
          role: recipient.value as any,
          isActive: true,
        },
        select: {
          email: true,
          name: true,
        },
      });

      users.forEach((user) => {
        if (user.email) {
          recipients.push({ email: user.email, name: user.name || undefined });
        }
      });
    }
  }

  return recipients;
}

/**
 * Generate email body
 */
function generateEmailBody(
  reportConfig: ReportConfig,
  generatedReport: GeneratedReport
): string {
  const highlights = generateHighlights(generatedReport);

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">${reportConfig.name}</h2>
          
          <p>Your scheduled report has been generated.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Key Highlights</h3>
            <ul>
              ${highlights.map((h) => `<li>${h}</li>`).join('')}
            </ul>
          </div>
          
          <p><strong>Date Range:</strong> ${formatDateRange(generatedReport.dateRange)}</p>
          <p><strong>Generated:</strong> ${formatDate(generatedReport.generatedAt)}</p>
          
          <div style="margin: 30px 0;">
            <a href="${generatedReport.fileUrl}" 
               style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Download Report (PDF)
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated report from the Ghana Emergency Response Platform.
            <br>
            To manage your report subscriptions, visit the Reports section in your dashboard.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate key highlights from report
 */
function generateHighlights(generatedReport: GeneratedReport): string[] {
  // This would extract highlights from the report metadata
  // For now, return sample highlights
  return [
    `Report generated with ${generatedReport.metadata.dataPoints} data points`,
    `Generation time: ${(generatedReport.metadata.generationTime / 1000).toFixed(1)}s`,
  ];
}

/**
 * Send email (placeholder - would integrate with email service)
 */
async function sendEmail(data: {
  to: string;
  subject: string;
  body: string;
  attachment?: { filename: string; url: string };
}): Promise<void> {
  // This would integrate with an email service like:
  // - AWS SES
  // - SendGrid
  // - Mailgun
  // - Nodemailer with SMTP

  console.log('Sending email:', {
    to: data.to,
    subject: data.subject,
    hasAttachment: !!data.attachment,
  });

  // Placeholder implementation
  // In production, this would use a real email service
}

/**
 * Format date range for display
 */
function formatDateRange(range: { start: Date; end: Date }): string {
  return `${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleString();
}

