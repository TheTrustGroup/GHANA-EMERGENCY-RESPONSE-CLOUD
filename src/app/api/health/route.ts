/**
 * Health Check Endpoint
 * Returns system health status for monitoring
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checks = {
    database: { status: 'unknown' as 'ok' | 'error' | 'unknown', latency: 0 },
    timestamp: new Date().toISOString(),
  };

  // Database check
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    checks.database = {
      status: 'ok',
      latency,
    };
  } catch (error) {
    checks.database = {
      status: 'error',
      latency: 0,
    };
  }

  // Determine overall health
  const isHealthy = checks.database.status === 'ok';
  const statusCode = isHealthy ? 200 : 503;

  const health = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: checks.timestamp,
    checks: {
      database: checks.database.status,
      databaseLatency: checks.database.latency,
    },
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  };

  return NextResponse.json(health, { status: statusCode });
}
