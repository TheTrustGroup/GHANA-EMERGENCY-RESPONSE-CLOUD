import { z } from 'zod';

/**
 * User Role Enumeration
 * Defines the different roles users can have in the Emergency Response Platform
 */
export enum UserRole {
  /** Regular citizen who can report incidents */
  CITIZEN = 'CITIZEN',
  /** First responder who can be dispatched to incidents */
  RESPONDER = 'RESPONDER',
  /** Dispatcher who manages incident assignments */
  DISPATCHER = 'DISPATCHER',
  /** Agency administrator with agency-level permissions */
  AGENCY_ADMIN = 'AGENCY_ADMIN',
  /** System administrator with full platform access */
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

/**
 * Zod schema for UserRole enum validation
 */
export const UserRoleSchema = z.nativeEnum(UserRole);

/**
 * Incident Severity Enumeration
 * Defines the severity levels for emergency incidents
 */
export enum IncidentSeverity {
  /** Low priority - non-urgent situations */
  LOW = 'LOW',
  /** Medium priority - requires attention but not immediately life-threatening */
  MEDIUM = 'MEDIUM',
  /** High priority - urgent situation requiring prompt response */
  HIGH = 'HIGH',
  /** Critical priority - life-threatening emergency requiring immediate response */
  CRITICAL = 'CRITICAL',
}

/**
 * Zod schema for IncidentSeverity enum validation
 */
export const IncidentSeveritySchema = z.nativeEnum(IncidentSeverity);

/**
 * Incident Status Enumeration
 * Tracks the current state of an incident in the response workflow
 */
export enum IncidentStatus {
  /** Incident has been reported but not yet dispatched */
  REPORTED = 'REPORTED',
  /** Incident has been dispatched to responders */
  DISPATCHED = 'DISPATCHED',
  /** Responders are actively working on the incident */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Incident has been resolved */
  RESOLVED = 'RESOLVED',
  /** Incident has been closed and archived */
  CLOSED = 'CLOSED',
}

/**
 * Zod schema for IncidentStatus enum validation
 */
export const IncidentStatusSchema = z.nativeEnum(IncidentStatus);

/**
 * Agency Type Enumeration
 * Defines the different types of emergency response agencies
 */
export enum AgencyType {
  /** National Disaster Management Organization */
  NADMO = 'NADMO',
  /** Ghana National Fire Service */
  FIRE_SERVICE = 'FIRE_SERVICE',
  /** Ghana Police Service */
  POLICE = 'POLICE',
  /** National Ambulance Service */
  AMBULANCE = 'AMBULANCE',
  /** Private responder organizations */
  PRIVATE_RESPONDER = 'PRIVATE_RESPONDER',
}

/**
 * Zod schema for AgencyType enum validation
 */
export const AgencyTypeSchema = z.nativeEnum(AgencyType);

