/**
 * Forgot Password API Route
 * Handles password reset requests
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      });
    }

    // Generate reset token (for future email implementation)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _resetToken = crypto.randomBytes(32).toString('hex');
    // Token expiry: 1 hour (stored in database when implementing token table)

    // Store reset token (you'd typically store this in a separate table)
    // For now, we'll use a simple approach - in production, use a dedicated table
    // await prisma.passwordResetToken.create({
    //   data: {
    //     userId: user.id,
    //     token: resetToken,
    //     expiresAt: resetTokenExpiry,
    //   },
    // });

    // TODO: Send email with reset link
    // const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetLink);

    // For now, log the token (remove in production)
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

