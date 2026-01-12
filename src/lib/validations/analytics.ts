/**
 * Analytics Validation Schemas
 */

import { z } from 'zod';

export const dateRangeSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const analyticsFiltersSchema = z.object({
  agencyId: z.string().cuid().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const auditFiltersSchema = z.object({
  userId: z.string().cuid().optional(),
  entity: z.string().optional(),
  entityId: z.string().optional(),
  action: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export type DateRange = z.infer<typeof dateRangeSchema>;
export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>;
export type AuditFilters = z.infer<typeof auditFiltersSchema>;

