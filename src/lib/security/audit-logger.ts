/**
 * Audit Logger
 * Comprehensive audit logging for security and compliance
 */

import { prisma } from '@/server/db';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  result?: 'success' | 'failure';
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Log audit event
 */
export async function logSecurityEvent(entry: AuditLogEntry): Promise<void> {
  try {
    // System user ID for system-generated events
    const systemUserId = 'system';

    await prisma.audit_logs.create({
      data: {
        userId: entry.userId || systemUserId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId || 'unknown',
        changes: {
          ...(entry.changes || {}),
          result: entry.result || 'success',
          error: entry.error,
          ...(entry.metadata || {}),
        },
        ipAddress: entry.ipAddress || undefined,
        userAgent: entry.userAgent || undefined,
      },
    });
  } catch (error) {
    // Don't fail the request if audit logging fails
    // But log the error
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  action: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'session_expired',
  userId: string | null,
  ipAddress?: string,
  userAgent?: string,
  error?: string
): Promise<void> {
  await logSecurityEvent({
    userId: userId || undefined,
    action,
    entity: 'User',
    entityId: userId || undefined,
    ipAddress,
    userAgent,
    result: action.includes('failed') || action === 'session_expired' ? 'failure' : 'success',
    error,
  });
}

/**
 * Log authorization failure
 */
export async function logAuthorizationFailure(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logSecurityEvent({
    userId,
    action: 'authorization_failed',
    entity,
    entityId,
    ipAddress,
    userAgent,
    result: 'failure',
    error: `User attempted ${action} on ${entity} ${entityId} without permission`,
    metadata: {
      attemptedAction: action,
    },
  });
}

/**
 * Log data modification
 */
export async function logDataModification(
  userId: string,
  action: 'create' | 'update' | 'delete',
  entity: string,
  entityId: string,
  before?: Record<string, any>,
  after?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logSecurityEvent({
    userId,
    action: `${entity}_${action}`,
    entity,
    entityId,
    changes: {
      before,
      after,
    },
    ipAddress,
    userAgent,
    result: 'success',
  });
}

/**
 * Log security event
 */
export async function logSecurityIncident(
  type:
    | 'rate_limit'
    | 'suspicious_pattern'
    | 'sql_injection'
    | 'xss'
    | 'path_traversal'
    | 'csrf_failure',
  details: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    url?: string;
    method?: string;
    payload?: any;
  }
): Promise<void> {
  await logSecurityEvent({
    userId: details.userId,
    action: `security_incident_${type}`,
    entity: 'Security',
    ipAddress: details.ipAddress,
    userAgent: details.userAgent,
    result: 'failure',
    metadata: {
      type,
      url: details.url,
      method: details.method,
      payload: details.payload,
    },
  });
}

/**
 * Log system event
 */
export async function logSystemEvent(action: string, details?: Record<string, any>): Promise<void> {
  await logSecurityEvent({
    action: `system_${action}`,
    entity: 'System',
    metadata: details,
    result: 'success',
  });
}
