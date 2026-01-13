/**
 * Agencies Router
 * Handles agency-related operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from '@/server/api/trpc';
import { createAgencySchema, updateAgencySchema } from '@/lib/validations/agency';
import { cachedQuery, invalidateQueryCache } from '@/lib/cache/trpc-cache';

export const agenciesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // Cache agencies list (10 minutes - changes infrequently)
    return cachedQuery(
      'agencies.getAll',
      {},
      async () => {
        const agencies = await ctx.prisma.agency.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            type: true,
            region: true,
            district: true,
            latitude: true,
            longitude: true,
          },
          orderBy: { name: 'asc' },
        });

        return agencies;
      },
      600000 // 10 minutes cache
    );
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const agency = await ctx.prisma.agency.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              users: true,
              incidents: true,
            },
          },
        },
      });

      if (!agency) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agency not found',
        });
      }

      return agency;
    }),

  create: adminProcedure.input(createAgencySchema).mutation(async ({ input, ctx }) => {
    const agency = await ctx.prisma.agency.create({
      data: input,
    });

    // Create audit log
    await ctx.prisma.auditLog.create({
      data: {
        userId: ctx.session.user.id,
        action: 'agency_created',
        entity: 'Agency',
        entityId: agency.id,
        changes: { name: input.name, type: input.type },
      },
    });

    // Invalidate cache
    invalidateQueryCache('agencies.getAll');

    return agency;
  }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        data: updateAgencySchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const agency = await ctx.prisma.agency.findUnique({
        where: { id: input.id },
      });

      if (!agency) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agency not found',
        });
      }

      const updated = await ctx.prisma.agency.update({
        where: { id: input.id },
        data: input.data,
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'agency_updated',
          entity: 'Agency',
          entityId: input.id,
          changes: input.data,
        },
      });

      // Invalidate cache
      invalidateQueryCache('agencies.getAll');

      return updated;
    }),

  getStats: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const agency = await ctx.prisma.agency.findUnique({
        where: { id: input.id },
      });

      if (!agency) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agency not found',
        });
      }

      // Get incident statistics
      const [totalIncidents, activeIncidents, completedIncidents] = await Promise.all([
        ctx.prisma.incident.count({
          where: { assignedAgencyId: input.id },
        }),
        ctx.prisma.incident.count({
          where: {
            assignedAgencyId: input.id,
            status: { not: 'CLOSED' },
          },
        }),
        ctx.prisma.incident.count({
          where: {
            assignedAgencyId: input.id,
            status: 'RESOLVED',
          },
        }),
      ]);

      // Calculate average response time
      const incidentsWithResponseTime = await ctx.prisma.incident.findMany({
        where: {
          assignedAgencyId: input.id,
          responseTime: { not: null },
        },
        select: { responseTime: true },
      });

      const avgResponseTime =
        incidentsWithResponseTime.length > 0
          ? incidentsWithResponseTime.reduce((sum, inc) => sum + (inc.responseTime || 0), 0) /
            incidentsWithResponseTime.length
          : null;

      // Get responder count
      const responderCount = await ctx.prisma.users.count({
        where: {
          agencyId: input.id,
          role: 'RESPONDER',
          isActive: true,
        },
      });

      return {
        totalIncidents,
        activeIncidents,
        completedIncidents,
        avgResponseTime: avgResponseTime ? Math.round(avgResponseTime) : null,
        responderCount,
      };
    }),

  getAgencyStats: protectedProcedure
    .input(z.object({ agencyId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const agency = await ctx.prisma.agency.findUnique({
        where: { id: input.agencyId },
        select: {
          id: true,
          name: true,
          type: true,
        },
      });

      if (!agency) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agency not found',
        });
      }

      // Get active incidents
      const activeIncidents = await ctx.prisma.incident.count({
        where: {
          assignedAgencyId: input.agencyId,
          status: { not: 'CLOSED' },
        },
      });

      // Get total and available responders
      const [totalResponders, availableResponders] = await Promise.all([
        ctx.prisma.users.count({
          where: {
            agencyId: input.agencyId,
            role: 'RESPONDER',
            isActive: true,
          },
        }),
        ctx.prisma.users.count({
          where: {
            agencyId: input.agencyId,
            role: 'RESPONDER',
            isActive: true,
            dispatchAssignments: {
              none: {
                status: {
                  in: ['DISPATCHED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'],
                },
              },
            },
          },
        }),
      ]);

      // Calculate average response time
      const incidentsWithResponseTime = await ctx.prisma.incident.findMany({
        where: {
          assignedAgencyId: input.agencyId,
          responseTime: { not: null },
        },
        select: { responseTime: true },
      });

      const avgResponseTime =
        incidentsWithResponseTime.length > 0
          ? Math.round(
              incidentsWithResponseTime.reduce((sum, inc) => sum + (inc.responseTime || 0), 0) /
                incidentsWithResponseTime.length
            )
          : 0;

      // Get resolved today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const resolvedToday = await ctx.prisma.incident.count({
        where: {
          assignedAgencyId: input.agencyId,
          status: 'RESOLVED',
          resolvedAt: { gte: today },
        },
      });

      // Calculate resolution rate
      const totalAssigned = await ctx.prisma.incident.count({
        where: {
          assignedAgencyId: input.agencyId,
        },
      });

      const resolvedTotal = await ctx.prisma.incident.count({
        where: {
          assignedAgencyId: input.agencyId,
          status: 'RESOLVED',
        },
      });

      const resolutionRate =
        totalAssigned > 0 ? Math.round((resolvedTotal / totalAssigned) * 100) : 0;

      // Generate trends data (last 30 days)
      const trendsData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await ctx.prisma.incident.count({
          where: {
            assignedAgencyId: input.agencyId,
            createdAt: {
              gte: date,
              lt: nextDate,
            },
          },
        });

        trendsData.push({
          day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          incidents: count,
        });
      }

      // Get category breakdown
      const categoryData = await ctx.prisma.incident.groupBy({
        by: ['category'],
        where: {
          assignedAgencyId: input.agencyId,
        },
        _count: true,
      });

      return {
        agency,
        activeIncidents,
        totalResponders,
        availableResponders,
        avgResponseTime,
        resolvedToday,
        resolutionRate,
        trendsData,
        categoryData: categoryData.map((item) => ({
          category: item.category,
          count: item._count,
        })),
      };
    }),
});
