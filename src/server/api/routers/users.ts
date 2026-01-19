/**
 * Users Router
 * Handles user-related operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '@/server/api/trpc';
import { updateProfileSchema, updateUserRoleSchema } from '@/lib/validations/user';
import { formatGhanaPhone } from '@/server/db/utils';

export const usersRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.users.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        agencies: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    // Remove sensitive data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }),

  updateProfile: protectedProcedure.input(updateProfileSchema).mutation(async ({ input, ctx }) => {
    const updateData: any = {};

    if (input.name) updateData.name = input.name;
    if (input.phone) updateData.phone = formatGhanaPhone(input.phone);
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;

    const updated = await ctx.prisma.users.update({
      where: { id: ctx.session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    // Create audit log
    await ctx.prisma.audit_logs.create({
      data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userId: ctx.session.user.id,
        action: 'profile_updated',
        entity: 'User',
        entityId: ctx.session.user.id,
        changes: updateData,
      },
    });

    return updated;
  }),

  getByAgency: protectedProcedure
    .input(z.object({ agencyId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      // Check if user has access to this agency
      if (
        ctx.session.user.role !== 'SYSTEM_ADMIN' &&
        ctx.session.user.role !== 'AGENCY_ADMIN' &&
        ctx.session.user.agencyId !== input.agencyId
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view users in this agency',
        });
      }

      const users = await ctx.prisma.users.findMany({
        where: { agencyId: input.agencyId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      });

      return users;
    }),

  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        ...updateUserRoleSchema.shape,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.users.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const updated = await ctx.prisma.users.update({
        where: { id: input.userId },
        data: { role: input.role },
      });

      // Create audit log
      await ctx.prisma.audit_logs.create({
        data: {
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: ctx.session.user.id,
          action: 'user_role_updated',
          entity: 'User',
          entityId: input.userId,
          changes: { role: input.role },
        },
      });

      return updated;
    }),

  deactivate: adminProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.users.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      if (user.id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot deactivate your own account',
        });
      }

      const updated = await ctx.prisma.users.update({
        where: { id: input.userId },
        data: { isActive: false },
      });

      // Create audit log
      await ctx.prisma.audit_logs.create({
        data: {
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: ctx.session.user.id,
          action: 'user_deactivated',
          entity: 'User',
          entityId: input.userId,
        },
      });

      return updated;
    }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        agencies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }),

  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const role = ctx.session.user.role;

    if (role === 'RESPONDER') {
      // Get responder-specific stats
      const assignments = await ctx.prisma.dispatch_assignments.findMany({
        where: {
          responderId: userId,
        },
        select: {
          status: true,
          completedAt: true,
          dispatchedAt: true,
          currentLatitude: true,
          currentLongitude: true,
        },
      });

      const completedToday = assignments.filter((a) => {
        if (a.status !== 'COMPLETED' || !a.completedAt) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(a.completedAt) >= today;
      }).length;

      // Calculate total distance (simplified - would need route calculation in production)
      const totalDistance = assignments.length * 5; // Placeholder

      // Calculate average response time
      const completedAssignments = assignments.filter(
        (a) => a.status === 'COMPLETED' && a.completedAt && a.dispatchedAt
      );
      const avgResponseTime =
        completedAssignments.length > 0
          ? Math.round(
              completedAssignments.reduce((sum, a) => {
                const responseTime =
                  new Date(a.completedAt!).getTime() - new Date(a.dispatchedAt).getTime();
                return sum + responseTime / 60000; // Convert to minutes
              }, 0) / completedAssignments.length
            )
          : 0;

      return {
        completedToday,
        totalDistance,
        avgResponseTime,
      };
    } else if (role === 'CITIZEN') {
      // Get citizen-specific stats
      const incidents = await ctx.prisma.incidents.findMany({
        where: {
          reportedById: userId,
        },
        select: {
          status: true,
        },
      });

      return {
        totalReports: incidents.length,
        activeReports: incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED')
          .length,
        resolvedReports: incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED')
          .length,
      };
    }

    return {
      totalReports: 0,
      activeReports: 0,
      resolvedReports: 0,
    };
  }),

  // Search users
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(2).max(100),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only admins can search all users
      if (ctx.session.user.role !== 'SYSTEM_ADMIN' && ctx.session.user.role !== 'AGENCY_ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to search users',
        });
      }

      const searchTerm = input.query.toLowerCase();

      const users = await ctx.prisma.users.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
        take: input.limit,
        orderBy: { name: 'asc' },
      });

      return users;
    }),
});
