/**
 * Audit Router
 * Handles audit log operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '@/server/api/trpc';
import { auditFiltersSchema } from '@/lib/validations/analytics';

export const auditRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        entity: z.string(),
        entityId: z.string(),
        changes: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get IP address from request
      const ipAddress =
        ctx.req.headers.get('x-forwarded-for') ||
        ctx.req.headers.get('x-real-ip') ||
        'unknown';

      // Get user agent
      const userAgent = ctx.req.headers.get('user-agent') || 'unknown';

      const auditLog = await ctx.prisma.audit_logs.create({
        data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: ctx.session.user.id,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          changes: input.changes ? (input.changes as any) : null,
          ipAddress,
          userAgent,
        },
      });

      return auditLog;
    }),

  getByEntity: protectedProcedure
    .input(
      z.object({
        entity: z.string(),
        entityId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const logs = await ctx.prisma.audit_logs.findMany({
        where: {
          entity: input.entity,
          entityId: input.entityId,
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return logs;
    }),

  getByUser: protectedProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      // Users can only view their own audit logs unless admin
      if (
        ctx.session.user.id !== input.userId &&
        ctx.session.user.role !== 'SYSTEM_ADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view your own audit logs',
        });
      }

      const logs = await ctx.prisma.audit_logs.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return logs;
    }),

  search: adminProcedure
    .input(auditFiltersSchema)
    .query(async ({ input, ctx }) => {
      const where: any = {};

      if (input.userId) where.userId = input.userId;
      if (input.entity) where.entity = input.entity;
      if (input.entityId) where.entityId = input.entityId;
      if (input.action) where.action = { contains: input.action, mode: 'insensitive' };
      if (input.startDate || input.endDate) {
        where.createdAt = {};
        if (input.startDate) where.createdAt.gte = input.startDate;
        if (input.endDate) where.createdAt.lte = input.endDate;
      }

      const [logs, total] = await Promise.all([
        ctx.prisma.audit_logs.findMany({
          where,
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        ctx.prisma.audit_logs.count({ where }),
      ]);

      return {
        logs,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          total,
          totalPages: Math.ceil(total / input.pageSize),
        },
      };
    }),

  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const logs = await ctx.prisma.audit_logs.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });

      return logs;
    }),
});

