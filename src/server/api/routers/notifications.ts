/**
 * Notifications Router
 * Handles user notifications
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const notificationsRouter = createTRPCRouter({
  getMyNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(100).default(20),
        unreadOnly: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: any = {
        userId: ctx.session.user.id,
      };

      if (input.unreadOnly) {
        where.isRead = false;
      }

      const notifications = await ctx.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });

      const unreadCount = await ctx.prisma.notification.count({
        where: {
          userId: ctx.session.user.id,
          isRead: false,
        },
      });

      return {
        notifications,
        unreadCount,
      };
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.prisma.notification.findUnique({
        where: { id: input.id },
      });

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Notification not found',
        });
      }

      if (notification.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only mark your own notifications as read',
        });
      }

      const updated = await ctx.prisma.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });

      return updated;
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await ctx.prisma.notification.updateMany({
        where: {
          userId: ctx.session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return { success: true };
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      const count = await ctx.prisma.notification.count({
        where: {
          userId: ctx.session.user.id,
          isRead: false,
        },
      });

      return { count };
    }),
});

