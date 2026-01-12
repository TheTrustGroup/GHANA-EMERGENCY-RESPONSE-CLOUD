/**
 * Analytics Router
 * Handles analytics and reporting operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { analyticsFiltersSchema } from '@/lib/validations/analytics';
import { canViewAnalytics } from '@/lib/auth-utils';
import { cachedQuery } from '@/lib/cache/trpc-cache';

export const analyticsRouter = createTRPCRouter({
  getIncidentStats: protectedProcedure
    .input(analyticsFiltersSchema)
    .query(async ({ input, ctx }) => {
      if (!canViewAnalytics(ctx.session.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view analytics',
        });
      }

      // Cache analytics (5 minutes)
      return cachedQuery(
        'analytics.getIncidentStats',
        input,
        async () => {
          const where: any = {};

          if (input.agencyId) where.assignedAgencyId = input.agencyId;
          if (input.region) where.region = input.region;
          if (input.district) where.district = input.district;
          if (input.startDate || input.endDate) {
            where.createdAt = {};
            if (input.startDate) where.createdAt.gte = input.startDate;
            if (input.endDate) where.createdAt.lte = input.endDate;
          }

          // Count by severity
          const bySeverity = await ctx.prisma.incident.groupBy({
            by: ['severity'],
            where,
            _count: true,
          });

          // Count by category
          const byCategory = await ctx.prisma.incident.groupBy({
            by: ['category'],
            where,
            _count: true,
          });

          // Count by status
          const byStatus = await ctx.prisma.incident.groupBy({
            by: ['status'],
            where,
            _count: true,
          });

          return {
            bySeverity: bySeverity.map((item) => ({
              severity: item.severity,
              count: item._count,
            })),
            byCategory: byCategory.map((item) => ({
              category: item.category,
              count: item._count,
            })),
            byStatus: byStatus.map((item) => ({
              status: item.status,
              count: item._count,
            })),
          };
        },
        300000 // 5 minutes cache
      );
    }),

  getResponseTimeMetrics: protectedProcedure
    .input(analyticsFiltersSchema)
    .query(async ({ input, ctx }) => {
      if (!canViewAnalytics(ctx.session.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view analytics',
        });
      }

      const where: any = {
        responseTime: { not: null },
      };

      if (input.agencyId) where.assignedAgencyId = input.agencyId;
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = input.startDate;
        if (input.endDate) where.createdAt.lte = input.endDate;
      }

      const incidents = await ctx.prisma.incident.findMany({
        where,
        select: {
          responseTime: true,
          assignedAgencyId: true,
          assignedAgency: {
            select: { id: true, name: true },
          },
        },
      });

      // Group by agency
      const byAgency = incidents.reduce(
        (acc, incident) => {
          const agencyId = incident.assignedAgencyId || 'unassigned';
          const agencyName = incident.assignedAgency?.name || 'Unassigned';

          if (!acc[agencyId]) {
            acc[agencyId] = {
              agencyId,
              agencyName,
              times: [],
              avgResponseTime: 0,
            };
          }

          if (incident.responseTime) {
            acc[agencyId].times.push(incident.responseTime);
          }

          return acc;
        },
        {} as Record<string, any>
      );

      // Calculate averages
      Object.values(byAgency).forEach((agency: any) => {
        if (agency.times.length > 0) {
          agency.avgResponseTime = Math.round(
            agency.times.reduce((sum: number, time: number) => sum + time, 0) / agency.times.length
          );
        }
        delete agency.times;
      });

      return {
        byAgency: Object.values(byAgency),
        overallAverage:
          incidents.length > 0
            ? Math.round(
                incidents.reduce((sum, inc) => sum + (inc.responseTime || 0), 0) / incidents.length
              )
            : null,
      };
    }),

  getGeographicDistribution: protectedProcedure.query(async ({ ctx }) => {
    if (!canViewAnalytics(ctx.session.user)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to view analytics',
      });
    }

    const byRegion = await ctx.prisma.incident.groupBy({
      by: ['region'],
      _count: true,
    });

    const byDistrict = await ctx.prisma.incident.groupBy({
      by: ['region', 'district'],
      _count: true,
    });

    return {
      byRegion: byRegion.map((item) => ({
        region: item.region,
        count: item._count,
      })),
      byDistrict: byDistrict.map((item) => ({
        region: item.region,
        district: item.district,
        count: item._count,
      })),
    };
  }),

  getAgencyPerformance: protectedProcedure
    .input(
      analyticsFiltersSchema.extend({
        agencyId: z.string().cuid().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!canViewAnalytics(ctx.session.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view analytics',
        });
      }

      const where: any = {};

      if (input.agencyId) where.assignedAgencyId = input.agencyId;
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = input.startDate;
        if (input.endDate) where.createdAt.lte = input.endDate;
      }

      const [totalIncidents, resolvedIncidents, avgResponseTime] = await Promise.all([
        ctx.prisma.incident.count({ where }),
        ctx.prisma.incident.count({
          where: { ...where, status: 'RESOLVED' },
        }),
        ctx.prisma.incident.aggregate({
          where: { ...where, responseTime: { not: null } },
          _avg: { responseTime: true },
        }),
      ]);

      const resolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0;

      return {
        totalIncidents,
        resolvedIncidents,
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        avgResponseTime: avgResponseTime._avg.responseTime
          ? Math.round(avgResponseTime._avg.responseTime)
          : null,
      };
    }),

  getDashboardStats: protectedProcedure
    .input(
      z.object({
        agencyId: z.string().cuid().optional(),
        dateRange: z.enum(['24h', '7d', '30d']).default('24h'),
      })
    )
    .query(async ({ input, ctx }) => {
      const now = new Date();
      const startDate = new Date();

      switch (input.dateRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      const where: any = {
        createdAt: { gte: startDate },
      };

      if (input.agencyId) {
        where.assignedAgencyId = input.agencyId;
      }

      // Role-based filtering
      if (ctx.session.user.role === 'AGENCY_ADMIN' && ctx.session.user.agencyId) {
        where.assignedAgencyId = ctx.session.user.agencyId;
      } else if (ctx.session.user.role === 'CITIZEN') {
        where.reportedById = ctx.session.user.id;
      }

      const [
        totalActive,
        criticalCount,
        totalAgencies,
        activeAgencies,
        avgResponseTime,
        resolvedToday,
      ] = await Promise.all([
        ctx.prisma.incident.count({
          where: {
            ...where,
            status: { notIn: ['RESOLVED', 'CLOSED'] },
          },
        }),
        ctx.prisma.incident.count({
          where: {
            ...where,
            severity: 'CRITICAL',
            status: { notIn: ['RESOLVED', 'CLOSED'] },
          },
        }),
        ctx.prisma.agency.count(),
        ctx.prisma.agency.count({ where: { isActive: true } }),
        ctx.prisma.incident.aggregate({
          where: {
            ...where,
            responseTime: { not: null },
          },
          _avg: { responseTime: true },
        }),
        ctx.prisma.incident.count({
          where: {
            ...where,
            status: 'RESOLVED',
            resolvedAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            },
          },
        }),
      ]);

      // Calculate 24h change
      const previousStart = new Date(startDate);
      previousStart.setHours(previousStart.getHours() - 24);

      const previousTotal = await ctx.prisma.incident.count({
        where: {
          ...where,
          createdAt: { gte: previousStart, lt: startDate },
          status: { notIn: ['RESOLVED', 'CLOSED'] },
        },
      });

      const change24h =
        previousTotal > 0 ? ((totalActive - previousTotal) / previousTotal) * 100 : 0;

      return {
        totalActive,
        criticalCount,
        totalAgencies,
        activeAgencies,
        avgResponseTime: avgResponseTime._avg.responseTime
          ? Math.round(avgResponseTime._avg.responseTime)
          : null,
        resolvedToday,
        change24h: Math.round(change24h * 10) / 10,
      };
    }),

  getResponseTimeTrends: protectedProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(90).default(30),
        agencyId: z.string().cuid().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - input.days);

      const where: any = {
        createdAt: { gte: startDate },
        responseTime: { not: null },
      };

      if (input.agencyId) {
        where.assignedAgencyId = input.agencyId;
      }

      if (ctx.session.user.role === 'AGENCY_ADMIN' && ctx.session.user.agencyId) {
        where.assignedAgencyId = ctx.session.user.agencyId;
      }

      const incidents = await ctx.prisma.incident.findMany({
        where,
        select: {
          createdAt: true,
          responseTime: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group by day
      const byDay: Record<string, { count: number; total: number }> = {};

      incidents.forEach((incident) => {
        const date = new Date(incident.createdAt).toISOString().split('T')[0];
        if (!byDay[date]) {
          byDay[date] = { count: 0, total: 0 };
        }
        byDay[date].count++;
        byDay[date].total += incident.responseTime || 0;
      });

      return Object.entries(byDay).map(([date, data]) => ({
        date,
        avgResponseTime: Math.round(data.total / data.count),
      }));
    }),

  getTopAgencies: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(10),
        dateRange: z.enum(['24h', '7d', '30d']).default('30d'),
      })
    )
    .query(async ({ input, ctx }) => {
      const now = new Date();
      const startDate = new Date();

      switch (input.dateRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
      }

      const agencies = await ctx.prisma.agency.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              incidents: {
                where: {
                  createdAt: { gte: startDate },
                },
              },
            },
          },
        },
      });

      // Calculate performance metrics
      const agencyPerformance = await Promise.all(
        agencies.map(async (agency) => {
          const incidents = await ctx.prisma.incident.findMany({
            where: {
              assignedAgencyId: agency.id,
              createdAt: { gte: startDate },
              responseTime: { not: null },
            },
            select: { responseTime: true },
          });

          const avgResponseTime =
            incidents.length > 0
              ? Math.round(
                  incidents.reduce((sum, inc) => sum + (inc.responseTime || 0), 0) /
                    incidents.length
                )
              : null;

          return {
            id: agency.id,
            name: agency.name,
            incidentCount: agency._count.incidents,
            avgResponseTime,
          };
        })
      );

      return agencyPerformance
        .sort((a, b) => {
          // Sort by incident count, then by response time
          if (b.incidentCount !== a.incidentCount) {
            return b.incidentCount - a.incidentCount;
          }
          if (a.avgResponseTime === null) return 1;
          if (b.avgResponseTime === null) return -1;
          return a.avgResponseTime - b.avgResponseTime;
        })
        .slice(0, input.limit);
    }),

  getIncidentsOverTime: protectedProcedure
    .input(
      analyticsFiltersSchema.extend({
        groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!canViewAnalytics(ctx.session.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view analytics',
        });
      }

      const where: any = {};

      if (input.agencyId) where.assignedAgencyId = input.agencyId;
      if (input.region) where.region = input.region;
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = input.startDate;
        if (input.endDate) where.createdAt.lte = input.endDate;
      }

      const incidents = await ctx.prisma.incident.findMany({
        where,
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group by time period
      const grouped: Record<string, number> = {};
      incidents.forEach((incident) => {
        const date = new Date(incident.createdAt);
        let key: string;

        switch (input.groupBy) {
          case 'hour':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
            break;
          case 'day':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekNum = Math.ceil((weekStart.getDate() + 6) / 7);
            key = `${weekStart.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0] || '';
        }

        grouped[key] = (grouped[key] || 0) + 1;
      });

      return Object.entries(grouped).map(([date, count]) => ({
        date,
        count,
      }));
    }),

  getTemporalPatterns: protectedProcedure
    .input(analyticsFiltersSchema)
    .query(async ({ input, ctx }) => {
      if (!canViewAnalytics(ctx.session.user)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view analytics',
        });
      }

      const where: any = {};

      if (input.agencyId) where.assignedAgencyId = input.agencyId;
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = input.startDate;
        if (input.endDate) where.createdAt.lte = input.endDate;
      }

      const incidents = await ctx.prisma.incident.findMany({
        where,
        select: {
          createdAt: true,
        },
      });

      // Group by hour of day
      const byHour: Record<number, number> = {};
      const byDayOfWeek: Record<number, number> = {};

      incidents.forEach((incident) => {
        const date = new Date(incident.createdAt);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();

        byHour[hour] = (byHour[hour] || 0) + 1;
        byDayOfWeek[dayOfWeek] = (byDayOfWeek[dayOfWeek] || 0) + 1;
      });

      return {
        byHour: Object.entries(byHour).map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        })),
        byDayOfWeek: Object.entries(byDayOfWeek).map(([day, count]) => ({
          day: parseInt(day),
          dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
          count,
        })),
      };
    }),

  getDispatchStats: protectedProcedure.query(async ({ ctx }) => {
    if (!canViewAnalytics(ctx.session.user)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to view analytics',
      });
    }

    // Get active incidents by severity
    const [critical, high, medium, low, total] = await Promise.all([
      ctx.prisma.incident.count({
        where: {
          severity: 'CRITICAL',
          status: { not: 'CLOSED' },
        },
      }),
      ctx.prisma.incident.count({
        where: {
          severity: 'HIGH',
          status: { not: 'CLOSED' },
        },
      }),
      ctx.prisma.incident.count({
        where: {
          severity: 'MEDIUM',
          status: { not: 'CLOSED' },
        },
      }),
      ctx.prisma.incident.count({
        where: {
          severity: 'LOW',
          status: { not: 'CLOSED' },
        },
      }),
      ctx.prisma.incident.count({
        where: {
          status: { not: 'CLOSED' },
        },
      }),
    ]);

    // Get active responders
    const activeResponders = await ctx.prisma.user.count({
      where: {
        role: 'RESPONDER',
        isActive: true,
        dispatchAssignments: {
          some: {
            status: {
              in: ['DISPATCHED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'],
            },
          },
        },
      },
    });

    // Get active incidents
    const active = await ctx.prisma.incident.count({
      where: {
        status: {
          in: ['DISPATCHED', 'IN_PROGRESS'],
        },
      },
    });

    // Calculate average response time (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentIncidents = await ctx.prisma.incident.findMany({
      where: {
        responseTime: { not: null },
        createdAt: { gte: oneDayAgo },
      },
      select: {
        responseTime: true,
      },
    });

    const avgResponseTime =
      recentIncidents.length > 0
        ? Math.round(
            recentIncidents.reduce((sum, inc) => sum + (inc.responseTime || 0), 0) /
              recentIncidents.length
          )
        : 0;

    // Get unread alerts (notifications)
    const unreadAlerts = await ctx.prisma.notification.count({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
    });

    return {
      critical,
      high,
      medium,
      low,
      total,
      activeResponders,
      active,
      avgResponseTime,
      unreadAlerts,
    };
  }),
});
