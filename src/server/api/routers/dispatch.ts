/**
 * Dispatch Router
 * Handles dispatch assignment operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, dispatcherProcedure } from '@/server/api/trpc';
import {
  createDispatchSchema,
  updateDispatchLocationSchema,
  completeDispatchSchema,
} from '@/lib/validations/dispatch';
import { canDispatchToAgency } from '@/lib/auth-utils';
import { createNotification, NotificationType } from '@/lib/notifications/notification-service';
import { broadcastIncidentUpdate } from '@/lib/realtime/pusher-server';

export const dispatchRouter = createTRPCRouter({
  create: dispatcherProcedure.input(createDispatchSchema).mutation(async ({ input, ctx }) => {
    // Verify incident exists
    const incident = await ctx.prisma.incidents.findUnique({
      where: { id: input.incidentId },
    });

    if (!incident) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Incident not found',
      });
    }

    // Verify agency exists
    const agency = await ctx.prisma.agencies.findUnique({
      where: { id: input.agencyId },
    });

    if (!agency || !agency.isActive) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Agency not found or inactive',
      });
    }

    // Check dispatch permissions
    if (!canDispatchToAgency(ctx.session.user, input.agencyId)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to dispatch to this agency',
      });
    }

    // Verify responder if provided
    if (input.responderId) {
      const responder = await ctx.prisma.users.findUnique({
        where: { id: input.responderId },
      });

      if (!responder || responder.role !== 'RESPONDER' || responder.agencyId !== input.agencyId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid responder for this agency',
        });
      }
    }

    const dispatch = await ctx.prisma.dispatch_assignments.create({
      data: {
        id: `dispatch-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        incidentId: input.incidentId,
        agencyId: input.agencyId,
        responderId: input.responderId!,
        priority: input.priority,
        dispatchNotes: input.notes || undefined,
        status: 'DISPATCHED',
      },
      include: {
        incidents: {
          select: {
            id: true,
            title: true,
            severity: true,
            latitude: true,
            longitude: true,
          },
        },
        agencies: {
          select: { id: true, name: true },
        },
        users: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create audit log
    await ctx.prisma.audit_logs.create({
      data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userId: ctx.session.user.id,
        action: 'dispatch_created',
        entity: 'DispatchAssignment',
        entityId: dispatch.id,
        changes: { incidentId: input.incidentId, agencyId: input.agencyId },
      },
    });

    // Notify responder if assigned
    if (dispatch.users) {
      await createNotification(dispatch.users.id, {
        type: NotificationType.DISPATCH_ASSIGNMENT,
        title: 'New Dispatch Assignment',
        message: `You've been assigned to: ${dispatch.incidents.title}`,
        relatedEntityType: 'dispatch',
        relatedEntityId: dispatch.id,
        priority: input.priority >= 4 ? 'critical' : 'high',
      });
    }

    // Notify agency admin
    const agencyAdmin = await ctx.prisma.users.findFirst({
      where: {
        agencyId: input.agencyId,
        role: 'AGENCY_ADMIN',
      },
    });

    if (agencyAdmin) {
      await createNotification(agencyAdmin.id, {
        type: NotificationType.DISPATCH_ASSIGNMENT,
        title: 'New Dispatch Assignment',
        message: `Incident "${dispatch.incidents.title}" assigned to your agency`,
        relatedEntityType: 'dispatch',
        relatedEntityId: dispatch.id,
        priority: 'normal',
      });
    }

    // Update incident status to DISPATCHED
    await ctx.prisma.incidents.update({
      where: { id: input.incidentId },
      data: {
        assignedAgencyId: input.agencyId,
        status: 'DISPATCHED',
      },
    });

    return dispatch;
  }),

  assign: dispatcherProcedure
    .input(
      z.object({
        incidentId: z.string().cuid(),
        agencyId: z.string().cuid(),
        priority: z.number().int().min(1).max(5).optional().default(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify incident exists
      const incident = await ctx.prisma.incidents.findUnique({
        where: { id: input.incidentId },
      });

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      // Verify agency exists
      const agency = await ctx.prisma.agencies.findUnique({
        where: { id: input.agencyId },
      });

      if (!agency || !agency.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agency not found or inactive',
        });
      }

      // Update incident
      const updated = await ctx.prisma.incidents.update({
        where: { id: input.incidentId },
        data: {
          assignedAgencyId: input.agencyId,
          status: 'DISPATCHED',
        },
      });

      // Create dispatch assignment
      // Note: responderId is required by Prisma, but we don't have one yet
      // We'll use a placeholder that will be updated when a responder accepts
      const systemResponderId = 'system-responder-placeholder';
      const dispatch = await ctx.prisma.dispatch_assignments.create({
        data: {
          id: `dispatch-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          incidentId: input.incidentId,
          agencyId: input.agencyId,
          responderId: systemResponderId,
          priority: input.priority,
          status: 'DISPATCHED',
        },
        include: {
          incidents: true,
          agencies: true,
        },
      });

      // Notify agency admin
      const agencyAdmin = await ctx.prisma.users.findFirst({
        where: {
          agencyId: input.agencyId,
          role: 'AGENCY_ADMIN',
        },
      });

      if (agencyAdmin) {
        await createNotification(agencyAdmin.id, {
          type: NotificationType.DISPATCH_ASSIGNMENT,
          title: 'New Dispatch Assignment',
          message: `Incident "${incident.title}" assigned to your agency`,
          relatedEntityType: 'dispatch',
          relatedEntityId: dispatch.id,
          priority: 'normal',
        });
      }

      return updated;
    }),

  accept: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input, ctx }) => {
      const dispatch = await ctx.prisma.dispatch_assignments.findUnique({
        where: { id: input.id },
      });

      if (!dispatch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Dispatch assignment not found',
        });
      }

      if (dispatch.responderId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This assignment is not for you',
        });
      }

      const updated = await ctx.prisma.dispatch_assignments.update({
        where: { id: input.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      // Create audit log
      await ctx.prisma.audit_logs.create({
        data: {
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: ctx.session.user.id,
          action: 'dispatch_accepted',
          entity: 'DispatchAssignment',
          entityId: input.id,
        },
      });

      return updated;
    }),

  updateLocation: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        ...updateDispatchLocationSchema.shape,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const dispatch = await ctx.prisma.dispatch_assignments.findUnique({
        where: { id: input.id },
      });

      if (!dispatch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Dispatch assignment not found',
        });
      }

      if (dispatch.responderId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own assignments',
        });
      }

      const updated = await ctx.prisma.dispatch_assignments.update({
        where: { id: input.id },
        data: {
          currentLatitude: input.latitude,
          currentLongitude: input.longitude,
        },
      });

      return updated;
    }),

  complete: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        ...completeDispatchSchema.shape,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const dispatch = await ctx.prisma.dispatch_assignments.findUnique({
        where: { id: input.id },
      });

      if (!dispatch) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Dispatch assignment not found',
        });
      }

      if (dispatch.responderId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only complete your own assignments',
        });
      }

      const updated = await ctx.prisma.dispatch_assignments.update({
        where: { id: input.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          dispatchNotes: input.notes,
        },
      });

      // Create audit log
      await ctx.prisma.audit_logs.create({
        data: {
          id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: ctx.session.user.id,
          action: 'dispatch_completed',
          entity: 'DispatchAssignment',
          entityId: input.id,
        },
      });

      return updated;
    }),

  getByIncident: protectedProcedure
    .input(z.object({ incidentId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const dispatches = await ctx.prisma.dispatch_assignments.findMany({
        where: { incidentId: input.incidentId },
        include: {
          agencies: {
            select: { id: true, name: true, type: true },
          },
          users: {
            select: { id: true, name: true, email: true },
          },
          incidents: {
            select: { id: true, title: true },
          },
        },
        orderBy: { dispatchedAt: 'desc' },
      });

      return dispatches;
    }),

  getAllActive: dispatcherProcedure.query(async ({ ctx }) => {
    const dispatches = await ctx.prisma.dispatch_assignments.findMany({
      where: {
        status: {
          notIn: ['COMPLETED'],
        },
      },
      include: {
        incidents: {
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
            latitude: true,
            longitude: true,
          },
        },
        agencies: {
          select: { id: true, name: true, type: true },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { dispatchedAt: 'desc' },
    });

    return dispatches;
  }),

  getRespondersByAgency: protectedProcedure
    .input(z.object({ agencyId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const responders = await ctx.prisma.users.findMany({
        where: {
          agencyId: input.agencyId,
          role: 'RESPONDER',
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          lastLatitude: true,
          lastLongitude: true,
        },
        orderBy: { name: 'asc' },
      });

      // Get current dispatch status for each responder
      const responderStatuses = await Promise.all(
        responders.map(async (responder) => {
          const activeDispatch = await ctx.prisma.dispatch_assignments.findFirst({
            where: {
              responderId: responder.id,
              status: {
                notIn: ['COMPLETED'],
              },
            },
            orderBy: { dispatchedAt: 'desc' },
            select: {
              id: true,
              currentLatitude: true,
              currentLongitude: true,
            },
          });

          // Use dispatch location if available, otherwise use user location
          const latitude = activeDispatch?.currentLatitude ?? responder.lastLatitude;
          const longitude = activeDispatch?.currentLongitude ?? responder.lastLongitude;

          return {
            ...responder,
            latitude,
            longitude,
            status: activeDispatch ? 'DISPATCHED' : 'AVAILABLE',
            currentDispatchId: activeDispatch?.id,
          };
        })
      );

      return responderStatuses;
    }),

  // Get active assignment for current responder
  getMyActiveAssignment: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== 'RESPONDER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only responders can access this',
      });
    }

    const assignment = await ctx.prisma.dispatch_assignments.findFirst({
      where: {
        responderId: ctx.session.user.id,
        status: {
          in: ['DISPATCHED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'],
        },
      },
      include: {
        incidents: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            severity: true,
            latitude: true,
            longitude: true,
            address: true,
            region: true,
            district: true,
            createdAt: true,
            mediaUrls: true,
          },
        },
        agencies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        dispatchedAt: 'desc',
      },
    });

    return assignment;
  }),

  // Get assignments for current responder
  getMyAssignments: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== 'RESPONDER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only responders can access this',
      });
    }

    const assignments = await ctx.prisma.dispatch_assignments.findMany({
      where: {
        responderId: ctx.session.user.id,
      },
      include: {
        incidents: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            severity: true,
            latitude: true,
            longitude: true,
            address: true,
            region: true,
            district: true,
            createdAt: true,
          },
        },
        agencies: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        dispatchedAt: 'desc',
      },
    });

    const active = assignments.find((a) =>
      ['DISPATCHED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'].includes(a.status)
    );

    const completedToday = assignments.filter((a) => {
      if (a.status !== 'COMPLETED' || !a.completedAt) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(a.completedAt) >= today;
    }).length;

    const completedThisWeek = assignments.filter((a) => {
      if (a.status !== 'COMPLETED' || !a.completedAt) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.completedAt) >= weekAgo;
    }).length;

    return {
      assignments,
      active,
      completedToday,
      completedThisWeek,
    };
  }),

  // Update assignment status (for responders)
  updateStatus: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string().cuid(),
        status: z.enum(['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED']),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const assignment = await ctx.prisma.dispatch_assignments.findUnique({
        where: { id: input.assignmentId },
        include: { incidents: true },
      });

      if (!assignment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assignment not found',
        });
      }

      if (assignment.responderId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own assignments',
        });
      }

      const updateData: any = {
        status: input.status,
        currentLatitude: input.latitude,
        currentLongitude: input.longitude,
      };

      if (input.status === 'ACCEPTED') {
        updateData.acceptedAt = new Date();
      } else if (input.status === 'EN_ROUTE') {
        updateData.enRouteAt = new Date();
      } else if (input.status === 'ARRIVED') {
        updateData.arrivedAt = new Date();
        // Update incident status
        await ctx.prisma.incidents.update({
          where: { id: assignment.incidentId },
          data: { status: 'IN_PROGRESS' },
        });
      } else if (input.status === 'COMPLETED') {
        updateData.completedAt = new Date();
        // Update incident status
        await ctx.prisma.incidents.update({
          where: { id: assignment.incidentId },
          data: { status: 'RESOLVED', resolvedAt: new Date() },
        });
      }

      const updated = await ctx.prisma.dispatch_assignments.update({
        where: { id: input.assignmentId },
        data: updateData,
      });

      // Update user location
      if (input.latitude && input.longitude) {
        await ctx.prisma.users.update({
          where: { id: ctx.session.user.id },
          data: {
            lastLatitude: input.latitude,
            lastLongitude: input.longitude,
            lastLocationUpdate: new Date(),
          },
        });
      }

      // Broadcast update
      try {
        await broadcastIncidentUpdate(assignment.incidentId, {
          status:
            input.status === 'ARRIVED'
              ? 'IN_PROGRESS'
              : input.status === 'COMPLETED'
                ? 'RESOLVED'
                : undefined,
        });
      } catch (error) {
        console.error('Pusher broadcast error:', error);
      }

      return updated;
    }),
});
