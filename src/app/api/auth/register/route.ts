/**
 * Registration API Route
 * Handles user registration with comprehensive validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { formatGhanaPhone } from '@/server/db/utils';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

// Enhanced registration validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  phone: z.string().regex(/^\+233[0-9]{9}$|^0[0-9]{9}$/, 'Invalid Ghana phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.nativeEnum(UserRole).default(UserRole.CITIZEN),
  agencyId: z.string().optional(),
  agencyCode: z.string().optional(), // For agency staff registration
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Normalize phone number
    const normalizedPhone = formatGhanaPhone(data.phone);

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          ...(data.email ? [{ email: data.email.toLowerCase() }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone or email already exists' },
        { status: 409 }
      );
    }

    // Verify agency code for non-citizen roles
    if (data.role !== UserRole.CITIZEN) {
      if (!data.agencyCode || !data.agencyId) {
        return NextResponse.json(
          { error: 'Agency code and ID required for this role' },
          { status: 400 }
        );
      }

      // Verify agency exists and is active
      const agency = await prisma.agencies.findFirst({
        where: {
          id: data.agencyId,
          isActive: true,
        },
      });

      if (!agency) {
        return NextResponse.json(
          { error: 'Invalid or inactive agency' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Generate user ID
    const userId = `user-${Date.now()}-${randomBytes(8).toString('hex')}`;

    // Create user
    const user = await prisma.users.create({
      data: {
        id: userId,
        name: data.name,
        phone: normalizedPhone,
        email: data.email && data.email.trim() ? data.email.toLowerCase().trim() : '',
        passwordHash,
        role: data.role,
        agencyId: data.agencyId || null,
        isActive: data.role === UserRole.CITIZEN, // Citizens are active immediately
        emailVerified: null,
        phoneVerified: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

