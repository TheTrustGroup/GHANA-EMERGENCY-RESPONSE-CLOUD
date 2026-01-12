/**
 * Type Definitions for Ghana Emergency Response Platform
 * 
 * This module serves as the single source of truth for all type definitions
 * used throughout the application. It includes:
 * - Enums for user roles, incident severity, status, and agency types
 * - Core data models for all entities in the system
 * - Zod schemas for runtime validation
 * 
 * All types are exported from this module to ensure consistency across the codebase.
 */

// Export all enums and their Zod schemas
export {
  UserRole,
  UserRoleSchema,
  IncidentSeverity,
  IncidentSeveritySchema,
  IncidentStatus,
  IncidentStatusSchema,
  AgencyType,
  AgencyTypeSchema,
} from './enums';

// Export all models and their Zod schemas
export type {
  User,
  Incident,
  Agency,
  Responder,
  DispatchAssignment,
  AuditLog,
} from './models';

export {
  UserSchema,
  IncidentSchema,
  AgencySchema,
  ResponderSchema,
  DispatchAssignmentSchema,
  AuditLogSchema,
} from './models';

// Export tRPC router type
export type { AppRouter } from '@/server/api/root';

/**
 * Utility type for creating partial types with required fields
 */
export type PartialWithRequired<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Utility type for API responses
 */
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

/**
 * Utility type for paginated responses
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Utility type for location coordinates
 */
export type Location = {
  latitude: number;
  longitude: number;
};

/**
 * Zod schema for Location validation
 */
import { z } from 'zod';
export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
