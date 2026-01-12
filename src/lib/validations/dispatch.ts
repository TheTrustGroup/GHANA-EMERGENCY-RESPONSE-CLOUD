/**
 * Dispatch Validation Schemas
 */

import { z } from 'zod';

export const createDispatchSchema = z.object({
  incidentId: z.string().cuid(),
  agencyId: z.string().cuid(),
  responderId: z.string().cuid().optional(),
  priority: z.number().int().min(1).max(5).default(3),
  notes: z.string().max(1000).optional(),
});

export const updateDispatchLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const completeDispatchSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export type CreateDispatchInput = z.infer<typeof createDispatchSchema>;
export type UpdateDispatchLocationInput = z.infer<typeof updateDispatchLocationSchema>;
export type CompleteDispatchInput = z.infer<typeof completeDispatchSchema>;

