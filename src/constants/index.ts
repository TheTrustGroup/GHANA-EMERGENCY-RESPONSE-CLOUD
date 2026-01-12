/**
 * Application Constants
 * Centralized constants for the Emergency Response Platform
 */

// Emergency Response Constants
export const EMERGENCY_TYPES = {
  MEDICAL: 'MEDICAL',
  FIRE: 'FIRE',
  POLICE: 'POLICE',
  NATURAL_DISASTER: 'NATURAL_DISASTER',
  OTHER: 'OTHER',
} as const;

export const EMERGENCY_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  EMERGENCIES: '/api/emergencies',
  RESPONDERS: '/api/responders',
  REPORTS: '/api/reports',
} as const;

