/**
 * Analytics Track API Route
 * Handles analytics event tracking
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get session (optional - analytics can work without auth)
    // const session = await getServerSession(authOptions);

    // Parse body
    const body = await request.json();
    const { event, properties } = body;

    // Validate
    if (!event || typeof event !== 'string') {
      return NextResponse.json({ error: 'Invalid event name' }, { status: 400 });
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {    }

    // In production, you could store this in a database or send to analytics service
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      event,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

// Explicitly disallow other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const dynamic = 'force-dynamic';
