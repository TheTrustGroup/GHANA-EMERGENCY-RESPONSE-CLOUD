/**
 * Registration API Route
 * Handles user registration
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { hashPassword } from '@/lib/auth';
import { formatGhanaPhone } from '@/server/db/utils';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  agencyId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: formatGhanaPhone(data.phone) }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: formatGhanaPhone(data.phone),
        passwordHash,
        role: data.role,
        agencyId: data.agencyId || null,
        isActive: data.role === UserRole.CITIZEN, // Citizens are active immediately
        emailVerified: null, // Will be verified via email
        phoneVerified: null,
      },
    });

    // TODO: Send verification email
    // TODO: Send SMS verification for phone

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

