/**
 * Authorization Utility Functions
 * Helper functions for checking user permissions and access control
 */

import { UserRole } from '@prisma/client';
import type { Incident } from '@/types';

/**
 * Check if user is system admin
 */
export function isSystemAdmin(user: { role: UserRole }): boolean {
  return user.role === UserRole.SYSTEM_ADMIN;
}

/**
 * Check if user is agency admin
 */
export function isAgencyAdmin(user: { role: UserRole }): boolean {
  return user.role === UserRole.AGENCY_ADMIN;
}

/**
 * Check if user is dispatcher
 */
export function isDispatcher(user: { role: UserRole }): boolean {
  return user.role === UserRole.DISPATCHER;
}

/**
 * Check if user is responder
 */
export function isResponder(user: { role: UserRole }): boolean {
  return user.role === UserRole.RESPONDER;
}

/**
 * Check if user can view an incident
 * Rules:
 * - System admins can view all
 * - Agency admins can view incidents assigned to their agency
 * - Dispatchers can view all incidents
 * - Responders can view incidents they're assigned to
 * - Citizens can view incidents they reported
 */
export function canAccessIncident(
  user: { id: string; role: UserRole; agencyId: string | null },
  incident: Incident
): boolean {
  // System admins and dispatchers can view all
  if (
    user.role === UserRole.SYSTEM_ADMIN ||
    user.role === UserRole.DISPATCHER
  ) {
    return true;
  }

  // Agency admins can view incidents assigned to their agency
  if (
    user.role === UserRole.AGENCY_ADMIN &&
    incident.assignedAgencyId === user.agencyId
  ) {
    return true;
  }

  // Responders can view incidents they're assigned to (check via dispatch assignments)
  if (user.role === UserRole.RESPONDER) {
    // This would need to check dispatch assignments in actual implementation
    // For now, allow if assigned to their agency
    return incident.assignedAgencyId === user.agencyId;
  }

  // Citizens can view incidents they reported
  if (user.role === UserRole.CITIZEN) {
    return incident.reportedById === user.id;
  }

  return false;
}

/**
 * Check if user can edit an incident
 * Rules:
 * - System admins can edit all
 * - Agency admins can edit incidents assigned to their agency
 * - Dispatchers can edit all incidents
 * - Responders and citizens cannot edit
 */
export function canEditIncident(
  user: { role: UserRole; agencyId: string | null },
  incident: Incident
): boolean {
  // System admins and dispatchers can edit all
  if (
    user.role === UserRole.SYSTEM_ADMIN ||
    user.role === UserRole.DISPATCHER
  ) {
    return true;
  }

  // Agency admins can edit incidents assigned to their agency
  if (
    user.role === UserRole.AGENCY_ADMIN &&
    incident.assignedAgencyId === user.agencyId
  ) {
    return true;
  }

  return false;
}

/**
 * Check if user can dispatch to an agency
 * Rules:
 * - System admins can dispatch to any agency
 * - Dispatchers can dispatch to any agency
 * - Agency admins can only dispatch to their own agency
 */
export function canDispatchToAgency(
  user: { role: UserRole; agencyId: string | null },
  agencyId: string
): boolean {
  // System admins and dispatchers can dispatch to any agency
  if (
    user.role === UserRole.SYSTEM_ADMIN ||
    user.role === UserRole.DISPATCHER
  ) {
    return true;
  }

  // Agency admins can only dispatch to their own agency
  if (user.role === UserRole.AGENCY_ADMIN) {
    return user.agencyId === agencyId;
  }

  return false;
}

/**
 * Check if user can view analytics
 * Rules:
 * - System admins can view all analytics
 * - Agency admins can view their agency analytics
 * - Dispatchers can view all analytics
 * - Others cannot view analytics
 */
export function canViewAnalytics(user: { role: UserRole }): boolean {
  return (
    user.role === UserRole.SYSTEM_ADMIN ||
    user.role === UserRole.AGENCY_ADMIN ||
    user.role === UserRole.DISPATCHER
  );
}

/**
 * Check if user has elevated permissions (admin or dispatcher)
 */
export function hasElevatedPermissions(user: { role: UserRole }): boolean {
  return (
    user.role === UserRole.SYSTEM_ADMIN ||
    user.role === UserRole.AGENCY_ADMIN ||
    user.role === UserRole.DISPATCHER
  );
}

