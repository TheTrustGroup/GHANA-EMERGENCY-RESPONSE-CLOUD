/**
 * Messages Router
 * Handles message-related operations for incidents
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { createNotification, NotificationType } from '@/lib/notifications/notification-service';

export const messagesRouter = createTRPCRouter({
  getByIncident: protectedProcedure
    .input(
      z.object({
        incidentId: z.string().cuid(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify incident exists and user has access
      const incident = await ctx.prisma.incidents.findUnique({
        where: { id: input.incidentId },
        select: {
          id: true,
          reportedById: true,
          assignedAgencyId: true,
        },
      });

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      // Check permissions
      // System admins and dispatchers can view all
      const canAccess =
        ctx.session.user.role === 'SYSTEM_ADMIN' ||
        ctx.session.user.role === 'DISPATCHER' ||
        // Agency admins can view incidents assigned to their agency
        (ctx.session.user.role === 'AGENCY_ADMIN' &&
          incident.assignedAgencyId === ctx.session.user.agencyId) ||
        // Citizens can view incidents they reported
        (ctx.session.user.role === 'CITIZEN' && incident.reportedById === ctx.session.user.id);

      if (!canAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view messages for this incident',
        });
      }

      const skip = (input.page - 1) * input.pageSize;

      const [messages, total] = await Promise.all([
        ctx.prisma.messages.findMany({
          where: { incidentId: input.incidentId },
          include: {
            users: {
              select: {
                id: true,
                name: true,
                role: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          skip,
          take: input.pageSize,
        }),
        ctx.prisma.messages.count({
          where: { incidentId: input.incidentId },
        }),
      ]);

      return {
        messages: messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.senderId,
          sender: msg.users,
          isSystemMessage: msg.isSystemMessage,
          createdAt: msg.createdAt,
        })),
        hasMore: skip + messages.length < total,
        total,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        incidentId: z.string().cuid(),
        content: z.string().min(1).max(1000),
        mediaUrls: z.array(z.string().url()).optional(),
        isUrgent: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify incident exists and user has access
      const incident = await ctx.prisma.incidents.findUnique({
        where: { id: input.incidentId },
        select: {
          id: true,
          reportedById: true,
          assignedAgencyId: true,
        },
      });

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      // Check permissions (same as view)
      const canAccess =
        ctx.session.user.role === 'SYSTEM_ADMIN' ||
        ctx.session.user.role === 'DISPATCHER' ||
        (ctx.session.user.role === 'AGENCY_ADMIN' &&
          incident.assignedAgencyId === ctx.session.user.agencyId) ||
        (ctx.session.user.role === 'CITIZEN' && incident.reportedById === ctx.session.user.id);

      if (!canAccess) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to send messages for this incident',
        });
      }

      const message = await ctx.prisma.messages.create({
        data: {
          id: `message-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          incidentId: input.incidentId,
          senderId: ctx.session.user.id,
          content: input.content,
          isSystemMessage: false,
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              role: true,
              email: true,
            },
          },
        },
      });

      // Create audit log
      await ctx.prisma.audit_logs.create({
        data: {
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: ctx.session.user.id,
          action: 'message_sent',
          entity: 'Message',
          entityId: message.id,
          changes: { incidentId: input.incidentId },
        },
      });

      // Notify all incident participants except sender
      const incidentWithParticipants = await ctx.prisma.incidents.findUnique({
        where: { id: input.incidentId },
        include: {
          users: { select: { id: true } },
          agencies: {
            include: {
              users: { select: { id: true } },
            },
          },
        },
      });

      if (incidentWithParticipants) {
        const participantIds = new Set<string>();

        // Add reporter
        if (
          incidentWithParticipants.reportedById &&
          incidentWithParticipants.reportedById !== ctx.session.user.id
        ) {
          participantIds.add(incidentWithParticipants.reportedById);
        }

        // Add agency users
        if (incidentWithParticipants.agencies) {
          incidentWithParticipants.agencies.users.forEach((user: { id: string }) => {
            if (user.id !== ctx.session.user.id) {
              participantIds.add(user.id);
            }
          });
        }

        // Get message senders
        const messageSenders = await ctx.prisma.messages.findMany({
          where: { incidentId: input.incidentId },
          select: { senderId: true },
          distinct: ['senderId'],
        });

        messageSenders.forEach((msg) => {
          if (msg.senderId !== ctx.session.user.id) {
            participantIds.add(msg.senderId);
          }
        });

        // Send notifications
        for (const userId of participantIds) {
          await createNotification(userId, {
            type: NotificationType.MESSAGE_RECEIVED,
            title: 'New Message',
            message: `${message.users?.name || 'Someone'}: ${input.content.substring(0, 50)}${input.content.length > 50 ? '...' : ''}`,
            relatedEntityType: 'message',
            relatedEntityId: message.id,
            priority: input.isUrgent ? 'high' : 'normal',
          });
        }
      }

      return {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        sender: message.users,
        isSystemMessage: message.isSystemMessage,
        createdAt: message.createdAt,
      };
    }),

  markAsRead: protectedProcedure
    .input(
      z.object({
        messageIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ input }) => {
      // Mark messages as read (would need a read status table or field)
      // For now, just return success
      void input; // Acknowledge input parameter
      return { success: true };
    }),

  getParticipants: protectedProcedure
    .input(
      z.object({
        incidentId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get all users who have sent messages or are involved in the incident
      const incident = await ctx.prisma.incidents.findUnique({
        where: { id: input.incidentId },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              role: true,
              email: true,
            },
          },
          assignedAgency: {
            include: {
              users: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      // Get unique message senders
      const messageSenders = await ctx.prisma.messages.findMany({
        where: { incidentId: input.incidentId },
        select: {
          senderId: true,
        },
        distinct: ['senderId'],
      });

      const senderIds = new Set(messageSenders.map((m) => m.senderId));

      // Get all participants
      const participants = await ctx.prisma.users.findMany({
        where: {
          OR: [
            ...(incident.reportedById ? [{ id: incident.reportedById }] : []),
            { id: { in: Array.from(senderIds) } },
            ...(incident.agencies ? [{ agencyId: incident.assignedAgencyId }] : []),
          ],
        },
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
        },
        distinct: ['id'],
      });

      return participants.map((p) => ({
        id: p.id,
        name: p.name || 'Unknown',
        role: p.role,
        email: p.email,
        isOnline: false, // TODO: Implement online status tracking
      }));
    }),
});
