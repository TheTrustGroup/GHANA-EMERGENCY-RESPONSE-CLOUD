/**
 * System Router
 * Handles system health monitoring and system-wide statistics
 */

import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '@/server/api/trpc';

export const systemRouter = createTRPCRouter({
  getHealth: adminProcedure.query(async ({ ctx }) => {
    // Check API server health
    const apiStartTime = Date.now();
    try {
      await ctx.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      // API is down
    }

    // Check database health
    const dbStartTime = Date.now();
    let dbStatus: 'operational' | 'degraded' | 'down' = 'operational';
    let dbQueryTime = 0;
    try {
      await ctx.prisma.$queryRaw`SELECT 1`;
      dbQueryTime = Date.now() - dbStartTime;
      if (dbQueryTime > 1000) {
        dbStatus = 'degraded';
      }
    } catch (error) {
      dbStatus = 'down';
    }

    // Check real-time (Pusher) - mock for now
    const realtimeStatus: 'operational' | 'degraded' | 'down' = 'operational';
    const realtimeConnections = Math.floor(Math.random() * 200) + 50; // Mock

    // Check storage (S3) - mock for now
    const storageStatus: 'operational' | 'degraded' | 'down' = 'operational';
    const storageUsage = 12.5; // GB

    // Check SMS Gateway - mock for now
    const smsStatus: 'operational' | 'degraded' | 'down' = 'degraded';
    const smsLatency = 450; // ms

    // Check cache (Redis) - mock for now
    const cacheStatus: 'operational' | 'degraded' | 'down' = 'operational';
    const cacheHitRate = 87; // %

    return {
      api: {
        status: 'operational' as const,
        responseTime: Date.now() - apiStartTime,
      },
      database: {
        status: dbStatus,
        queryTime: dbQueryTime,
      },
      realtime: {
        status: realtimeStatus,
        connections: realtimeConnections,
      },
      storage: {
        status: storageStatus,
        usage: storageUsage,
      },
      sms: {
        status: smsStatus,
        latency: smsLatency,
      },
      cache: {
        status: cacheStatus,
        hitRate: cacheHitRate,
      },
    };
  }),

  getSystemStats: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(['24h', '7d', '30d']).default('24h'),
      })
    )
    .query(async ({ input, ctx }) => {
      const now = new Date();
      const startDate = new Date(now);
      
      if (input.timeRange === '24h') {
        startDate.setHours(now.getHours() - 24);
      } else if (input.timeRange === '7d') {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setDate(now.getDate() - 30);
      }

      // Get active incidents
      const activeIncidents = await ctx.prisma.incident.count({
        where: {
          status: {
            in: ['REPORTED', 'DISPATCHED', 'IN_PROGRESS'],
          },
        },
      });

      // Get critical incidents
      const critical = await ctx.prisma.incident.count({
        where: {
          severity: 'CRITICAL',
          status: {
            in: ['REPORTED', 'DISPATCHED', 'IN_PROGRESS'],
          },
        },
      });

      const high = await ctx.prisma.incident.count({
        where: {
          severity: 'HIGH',
          status: {
            in: ['REPORTED', 'DISPATCHED', 'IN_PROGRESS'],
          },
        },
      });

      const medium = await ctx.prisma.incident.count({
        where: {
          severity: 'MEDIUM',
          status: {
            in: ['REPORTED', 'DISPATCHED', 'IN_PROGRESS'],
          },
        },
      });

      const low = await ctx.prisma.incident.count({
        where: {
          severity: 'LOW',
          status: {
            in: ['REPORTED', 'DISPATCHED', 'IN_PROGRESS'],
          },
        },
      });

      // Get active responders
      const activeResponders = await ctx.prisma.users.count({
        where: {
          role: 'RESPONDER',
          status: {
            in: ['AVAILABLE', 'DISPATCHED', 'EN_ROUTE', 'ON_SCENE'],
          },
        },
      });

      const totalResponders = await ctx.prisma.users.count({
        where: {
          role: 'RESPONDER',
        },
      });

      // Get agencies
      const totalAgencies = await ctx.prisma.agency.count();
      const onlineAgencies = await ctx.prisma.agency.count({
        where: {
          isActive: true,
        },
      });

      // Calculate average response time
      const incidentsWithResponseTime = await ctx.prisma.incident.findMany({
        where: {
          responseTime: { not: null },
          createdAt: { gte: startDate },
        },
        select: {
          responseTime: true,
        },
      });

      const avgResponseTime =
        incidentsWithResponseTime.length > 0
          ? Math.round(
              incidentsWithResponseTime.reduce(
                (sum, inc) => sum + (inc.responseTime || 0),
                0
              ) / incidentsWithResponseTime.length
            )
          : 0;

      // Get previous period for comparison
      const prevStartDate = new Date(startDate);
      const periodDiff =
        input.timeRange === '24h'
          ? 24 * 60 * 60 * 1000
          : input.timeRange === '7d'
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;
      prevStartDate.setTime(prevStartDate.getTime() - periodDiff);

      const prevActiveIncidents = await ctx.prisma.incident.count({
        where: {
          status: {
            in: ['REPORTED', 'DISPATCHED', 'IN_PROGRESS'],
          },
          createdAt: {
            gte: prevStartDate,
            lt: startDate,
          },
        },
      });

      const incidentChange =
        prevActiveIncidents > 0
          ? Math.round(
              ((activeIncidents - prevActiveIncidents) / prevActiveIncidents) * 100
            )
          : 0;

      // Generate trends data (last 7 days)
      const trendsData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const count = await ctx.prisma.incident.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        trendsData.push({
          day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
          incidents: count,
        });
      }

      // Severity distribution
      const severityData = [
        { name: 'Critical', value: critical },
        { name: 'High', value: high },
        { name: 'Medium', value: medium },
        { name: 'Low', value: low },
      ];

      // Response time distribution
      const responseTimeData = [
        { range: '<5m', count: 0 },
        { range: '5-10m', count: 0 },
        { range: '10-20m', count: 0 },
        { range: '20-30m', count: 0 },
        { range: '30m+', count: 0 },
      ];

      incidentsWithResponseTime.forEach((inc) => {
        const time = inc.responseTime || 0;
        if (time < 5) responseTimeData[0].count++;
        else if (time < 10) responseTimeData[1].count++;
        else if (time < 20) responseTimeData[2].count++;
        else if (time < 30) responseTimeData[3].count++;
        else responseTimeData[4].count++;
      });

      // Unread alerts (notifications)
      const unreadAlerts = await ctx.prisma.notification.count({
        where: {
          isRead: false,
          type: 'SYSTEM_ALERT',
        },
      });

      return {
        activeIncidents,
        critical,
        high,
        medium,
        low,
        activeResponders,
        totalResponders,
        totalAgencies,
        onlineAgencies,
        avgResponseTime,
        incidentChange,
        responseTimeChange: -18, // Mock
        trendsData,
        severityData,
        responseTimeData,
        unreadAlerts,
      };
    }),
});
