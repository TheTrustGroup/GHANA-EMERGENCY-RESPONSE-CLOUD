/**
 * Incident Form Validation Schemas
 * Multi-step form validation for incident reporting
 */

import { z } from 'zod';
import { IncidentSeverity } from '@prisma/client';

// Step 1: Incident Type
export const incidentTypeSchema = z.object({
  category: z.enum([
    'fire',
    'medical',
    'accident',
    'natural_disaster',
    'crime',
    'infrastructure',
    'other',
  ]),
  severity: z.nativeEnum(IncidentSeverity),
});

// Step 2: Location
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  district: z.string().min(1, 'District is required'),
});

// Step 3: Details
export const detailsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be 1000 characters or less'),
  estimatedAffectedPeople: z.number().int().positive().optional(),
  mediaUrls: z.array(z.string().url()).default([]),
});

// Step 4: Contact (for CITIZEN role)
export const contactSchema = z.object({
  phone: z.string().optional(),
  alternativeContact: z.string().optional(),
  anonymous: z.boolean().default(false),
});

// Complete form schema
export const incidentFormSchema = incidentTypeSchema
  .merge(locationSchema)
  .merge(detailsSchema)
  .merge(contactSchema);

export type IncidentFormData = z.infer<typeof incidentFormSchema>;
export type IncidentTypeData = z.infer<typeof incidentTypeSchema>;
export type LocationData = z.infer<typeof locationSchema>;
export type DetailsData = z.infer<typeof detailsSchema>;
export type ContactData = z.infer<typeof contactSchema>;

