/**
 * Agency Validation Schemas
 */

import { z } from 'zod';
import { AgencyType } from '@prisma/client';

export const createAgencySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: z.nativeEnum(AgencyType),
  description: z.string().max(1000).optional(),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  region: z.string().min(1, 'Region is required'),
  district: z.string().min(1, 'District is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateAgencySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.nativeEnum(AgencyType).optional(),
  description: z.string().max(1000).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isActive: z.boolean().optional(),
});

export type CreateAgencyInput = z.infer<typeof createAgencySchema>;
export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>;

