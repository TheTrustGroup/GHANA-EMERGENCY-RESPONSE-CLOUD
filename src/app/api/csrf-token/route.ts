/**
 * CSRF Token API Endpoint
 * Returns CSRF token for client-side forms
 */

import { NextResponse } from 'next/server';
import { getCSRFToken } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = await getCSRFToken();
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
