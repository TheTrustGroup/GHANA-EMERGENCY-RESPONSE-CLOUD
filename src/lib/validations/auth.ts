/**
 * Authentication Validation Schemas
 * Zod schemas for login and registration forms
 */

import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * Ghana phone number regex
 * Matches: +233XXXXXXXXX or 0XXXXXXXXX
 */
const ghanaPhoneRegex = /^(\+233|0)[0-9]{9}$/;

/**
 * Login schema
 * Supports email or phone number login
 */
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or phone number is required')
    .refine(
      (val) => {
        // Check if it's an email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(val)) return true;
        // Check if it's a Ghana phone number
        if (ghanaPhoneRegex.test(val)) return true;
        return false;
      },
      {
        message: 'Please enter a valid email or Ghana phone number (+233XXXXXXXXX)',
      }
    ),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration schema
 */
export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
    phone: z
      .string()
      .regex(ghanaPhoneRegex, 'Please enter a valid Ghana phone number (+233XXXXXXXXX)'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
    role: z.nativeEnum(UserRole).default(UserRole.CITIZEN),
    agencyId: z.string().optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms of service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      // If role is RESPONDER, agencyId is required
      if (data.role === UserRole.RESPONDER && !data.agencyId) {
        return false;
      }
      return true;
    },
    {
      message: 'Agency selection is required for responders',
      path: ['agencyId'],
    }
  );

export type RegisterInput = z.infer<typeof registerSchema>;

