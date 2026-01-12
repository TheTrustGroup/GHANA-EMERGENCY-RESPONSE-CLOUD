import { z } from 'zod';
import {
  UserRole,
  UserRoleSchema,
  IncidentSeverity,
  IncidentSeveritySchema,
  IncidentStatus,
  IncidentStatusSchema,
  AgencyType,
  AgencyTypeSchema,
} from './enums';

/**
 * User Model
 * Represents a user in the Emergency Response Platform
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's email address (unique) */
  email: string;
  /** User's full name */
  name: string | null;
  /** User's phone number */
  phone: string | null;
  /** User's role in the system */
  role: UserRole;
  /** Whether the user's email is verified */
  emailVerified: boolean | null;
  /** URL to user's profile image */
  image: string | null;
  /** User's current location (latitude) */
  latitude: number | null;
  /** User's current location (longitude) */
  longitude: number | null;
  /** Whether the user account is active */
  isActive: boolean;
  /** Agency ID if user belongs to an agency */
  agencyId: string | null;
  /** Timestamp when the user was created */
  createdAt: Date;
  /** Timestamp when the user was last updated */
  updatedAt: Date;
  /** Timestamp of last login */
  lastLoginAt: Date | null;
}

/**
 * Zod schema for User model validation
 */
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  role: UserRoleSchema,
  emailVerified: z.boolean().nullable(),
  image: z.string().url().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  isActive: z.boolean(),
  agencyId: z.string().cuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().nullable(),
});

/**
 * Incident Model
 * Represents an emergency incident reported in the system
 */
export interface Incident {
  /** Unique identifier for the incident */
  id: string;
  /** Title/summary of the incident */
  title: string;
  /** Detailed description of the incident */
  description: string;
  /** Severity level of the incident */
  severity: IncidentSeverity;
  /** Current status of the incident */
  status: IncidentStatus;
  /** Type/category of the incident */
  incidentType: string;
  /** Latitude coordinate of the incident location */
  latitude: number;
  /** Longitude coordinate of the incident location */
  longitude: number;
  /** Human-readable address of the incident */
  address: string | null;
  /** City where the incident occurred */
  city: string | null;
  /** Region where the incident occurred */
  region: string | null;
  /** ID of the user who reported the incident */
  reportedById: string;
  /** ID of the agency assigned to handle the incident */
  assignedAgencyId: string | null;
  /** Number of people affected */
  affectedCount: number | null;
  /** Whether there are injuries */
  hasInjuries: boolean;
  /** Whether there are fatalities */
  hasFatalities: boolean;
  /** Additional metadata as JSON */
  metadata: Record<string, unknown> | null;
  /** Timestamp when the incident was created */
  createdAt: Date;
  /** Timestamp when the incident was last updated */
  updatedAt: Date;
  /** Timestamp when the incident was resolved */
  resolvedAt: Date | null;
  /** Timestamp when the incident was closed */
  closedAt: Date | null;
}

/**
 * Zod schema for Incident model validation
 */
export const IncidentSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  severity: IncidentSeveritySchema,
  status: IncidentStatusSchema,
  incidentType: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  reportedById: z.string().cuid(),
  assignedAgencyId: z.string().cuid().nullable(),
  affectedCount: z.number().int().positive().nullable(),
  hasInjuries: z.boolean(),
  hasFatalities: z.boolean(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  resolvedAt: z.date().nullable(),
  closedAt: z.date().nullable(),
});

/**
 * Agency Model
 * Represents an emergency response agency
 */
export interface Agency {
  /** Unique identifier for the agency */
  id: string;
  /** Name of the agency */
  name: string;
  /** Type of agency */
  type: AgencyType;
  /** Agency's contact email */
  email: string | null;
  /** Agency's contact phone number */
  phone: string | null;
  /** Agency's headquarters address */
  address: string | null;
  /** City where the agency is located */
  city: string | null;
  /** Region where the agency operates */
  region: string | null;
  /** Agency's latitude coordinate */
  latitude: number | null;
  /** Agency's longitude coordinate */
  longitude: number | null;
  /** Agency's logo URL */
  logo: string | null;
  /** Whether the agency is active */
  isActive: boolean;
  /** Number of available responders */
  availableResponders: number;
  /** Total number of responders in the agency */
  totalResponders: number;
  /** Timestamp when the agency was created */
  createdAt: Date;
  /** Timestamp when the agency was last updated */
  updatedAt: Date;
}

/**
 * Zod schema for Agency model validation
 */
export const AgencySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(200),
  type: AgencyTypeSchema,
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  logo: z.string().url().nullable(),
  isActive: z.boolean(),
  availableResponders: z.number().int().min(0),
  totalResponders: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Responder Model
 * Represents a first responder who can be dispatched to incidents
 */
export interface Responder {
  /** Unique identifier for the responder */
  id: string;
  /** ID of the user account associated with this responder */
  userId: string;
  /** ID of the agency the responder belongs to */
  agencyId: string;
  /** Responder's badge/identification number */
  badgeNumber: string | null;
  /** Responder's current status (available, on-duty, off-duty) */
  status: string;
  /** Responder's current latitude */
  currentLatitude: number | null;
  /** Responder's current longitude */
  currentLongitude: number | null;
  /** Responder's specialization/certifications */
  specializations: string[];
  /** Whether the responder is currently available for dispatch */
  isAvailable: boolean;
  /** Number of active incidents the responder is handling */
  activeIncidentsCount: number;
  /** Timestamp when the responder was created */
  createdAt: Date;
  /** Timestamp when the responder was last updated */
  updatedAt: Date;
  /** Timestamp of last location update */
  lastLocationUpdateAt: Date | null;
}

/**
 * Zod schema for Responder model validation
 */
export const ResponderSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  agencyId: z.string().cuid(),
  badgeNumber: z.string().nullable(),
  status: z.string(),
  currentLatitude: z.number().nullable(),
  currentLongitude: z.number().nullable(),
  specializations: z.array(z.string()),
  isAvailable: z.boolean(),
  activeIncidentsCount: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLocationUpdateAt: z.date().nullable(),
});

/**
 * Dispatch Assignment Model
 * Represents an assignment of a responder to an incident
 */
export interface DispatchAssignment {
  /** Unique identifier for the dispatch assignment */
  id: string;
  /** ID of the incident being assigned */
  incidentId: string;
  /** ID of the responder being assigned */
  responderId: string;
  /** ID of the dispatcher who made the assignment */
  dispatchedById: string;
  /** Status of the assignment */
  status: string;
  /** Priority level of the assignment */
  priority: number;
  /** Instructions for the responder */
  instructions: string | null;
  /** Estimated time of arrival (in minutes) */
  estimatedArrivalMinutes: number | null;
  /** Actual time of arrival */
  arrivedAt: Date | null;
  /** Timestamp when the assignment was created */
  createdAt: Date;
  /** Timestamp when the assignment was last updated */
  updatedAt: Date;
  /** Timestamp when the assignment was completed */
  completedAt: Date | null;
}

/**
 * Zod schema for DispatchAssignment model validation
 */
export const DispatchAssignmentSchema = z.object({
  id: z.string().cuid(),
  incidentId: z.string().cuid(),
  responderId: z.string().cuid(),
  dispatchedById: z.string().cuid(),
  status: z.string(),
  priority: z.number().int().min(1).max(10),
  instructions: z.string().nullable(),
  estimatedArrivalMinutes: z.number().int().positive().nullable(),
  arrivedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
});

/**
 * Audit Log Model
 * Represents an audit trail entry for system actions
 */
export interface AuditLog {
  /** Unique identifier for the audit log entry */
  id: string;
  /** Type of action that was logged */
  action: string;
  /** Entity type that was affected */
  entityType: string;
  /** ID of the entity that was affected */
  entityId: string | null;
  /** ID of the user who performed the action */
  userId: string | null;
  /** IP address of the user */
  ipAddress: string | null;
  /** User agent string */
  userAgent: string | null;
  /** Additional metadata about the action */
  metadata: Record<string, unknown> | null;
  /** Timestamp when the action occurred */
  createdAt: Date;
}

/**
 * Zod schema for AuditLog model validation
 */
export const AuditLogSchema = z.object({
  id: z.string().cuid(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().cuid().nullable(),
  userId: z.string().cuid().nullable(),
  ipAddress: z.string().ip().nullable(),
  userAgent: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.date(),
});

