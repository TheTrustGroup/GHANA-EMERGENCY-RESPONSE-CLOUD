/**
 * Agencies API Route
 * Returns list of active agencies
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET() {
  try {
    const agencies = await prisma.agency.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ agencies });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agencies' },
      { status: 500 }
    );
  }
}

