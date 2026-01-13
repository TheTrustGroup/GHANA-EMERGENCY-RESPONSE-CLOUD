/**
 * Verify Email API Route
 * Verifies email address with token
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // TODO: Verify token from database
    // For now, this is a placeholder implementation
    // In production, you'd have a verification token table:
    // const verification = await prisma.emailVerification.findUnique({
    //   where: { token },
    //   include: { user: true },
    // });

    // if (!verification || verification.expiresAt < new Date()) {
    //   return NextResponse.json(
    //     { success: false, error: 'Invalid or expired verification token' },
    //     { status: 400 }
    //   );
    // }

    // Update user email verification status
    // await prisma.user.update({
    //   where: { id: verification.userId },
    //   data: { emailVerified: new Date() },
    // });

    // Delete verification token
    // await prisma.emailVerification.delete({
    //   where: { token },
    // });

    // For now, return success (implement proper token validation in production)
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

