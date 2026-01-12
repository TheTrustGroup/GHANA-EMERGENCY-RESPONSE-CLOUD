/**
 * Incident Validation Schemas
 */

import { z } from 'zod';
import { IncidentSeverity, IncidentStatus, IncidentCategory } from '@prisma/client';

export const createIncidentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description too long'),
  severity: z.nativeEnum(IncidentSeverity),
  category: z.nativeEnum(IncidentCategory),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  district: z.string().min(1, 'District is required'),
  mediaUrls: z.array(z.string().url()).default([]),
  estimatedAffectedPeople: z.number().int().positive().optional(),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  severity: z.nativeEnum(IncidentSeverity).optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  category: z.nativeEnum(IncidentCategory).optional(),
  address: z.string().optional(),
  region: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  estimatedAffectedPeople: z.number().int().positive().optional(),
  responseTime: z.number().int().positive().optional(),
});

export const incidentFiltersSchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  severity: z.nativeEnum(IncidentSeverity).optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  assignedAgencyId: z.string().optional(),
  reportedById: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'severity', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const nearbyIncidentsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().int().positive().max(100), // kilometers
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type IncidentFilters = z.infer<typeof incidentFiltersSchema>;
export type NearbyIncidentsInput = z.infer<typeof nearbyIncidentsSchema>;

