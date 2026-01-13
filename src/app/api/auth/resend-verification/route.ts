/**
 * Resend Verification Email API Route
 * Sends a new verification email
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
// import crypto from 'crypto'; // For future token generation

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
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a verification email has been sent.',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified.',
      });
    }

    // Generate verification token (for future email implementation)
    // const verificationToken = crypto.randomBytes(32).toString('hex');
    // Token expiry: 24 hours (stored in database when implementing token table)

    // TODO: Store verification token in database
    // await prisma.emailVerification.create({
    //   data: {
    //     userId: user.id,
    //     token: verificationToken,
    //     expiresAt,
    //   },
    // });

    // TODO: Send verification email
    // const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
    // await sendVerificationEmail(user.email, verificationLink);

    // For now, log the token (remove in production)
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a verification email has been sent.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email. Please try again.' },
      { status: 500 }
    );
  }
}

