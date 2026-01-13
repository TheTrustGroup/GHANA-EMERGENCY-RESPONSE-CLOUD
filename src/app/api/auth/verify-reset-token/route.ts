/**
 * Verify Reset Token API Route
 * Validates password reset token
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // TODO: Verify token against database
    // For now, just check if token exists and is valid format
    const isValid = token.length === 64; // 32 bytes hex = 64 chars

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

