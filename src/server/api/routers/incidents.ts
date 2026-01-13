/**
 * Incidents Router
 * Handles incident-related operations
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  dispatcherProcedure,
  publicProcedure,
} from '@/server/api/trpc';
import {
  createIncidentSchema,
  updateIncidentSchema,
  incidentFiltersSchema,
  nearbyIncidentsSchema,
} from '@/lib/validations/incident';
import { IncidentStatus, IncidentSeverity } from '@prisma/client';
import { canAccessIncident, canEditIncident } from '@/lib/auth-utils';
import {
  calculateDistance,
  getRegionFromCoordinates,
  getDistrictFromCoordinates,
} from '@/server/db/utils';
import { sendToAgency, NotificationType } from '@/lib/notifications/notification-service';
import { broadcastNewIncident, broadcastIncidentUpdate } from '@/lib/realtime/pusher-server';
import { cachedQuery, invalidateQueryCache, invalidateCache } from '@/lib/cache/trpc-cache';

export const incidentsRouter = createTRPCRouter({
  // Public create for anonymous reporting
  createPublic: publicProcedure
    .input(
      z.object({
        category: z.enum([
          'FIRE',
          'MEDICAL',
          'ACCIDENT',
          'NATURAL_DISASTER',
          'CRIME',
          'INFRASTRUCTURE',
          'OTHER',
        ]),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
        title: z.string().min(5).max(200),
        description: z.string().max(2000).optional(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().optional(),
        mediaUrls: z.array(z.string()).max(5).optional(),
        reporterPhone: z.string().optional(),
        reporterName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Determine region from coordinates (simplified)
      const region = getRegionFromCoordinates(input.latitude, input.longitude) || 'Unknown Region';
      const district = getDistrictFromCoordinates(input.latitude, input.longitude);

      // Create incident
      const incident = await ctx.prisma.incidents.create({
        data: {
          id: `incident-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          ...input,
          region,
          district,
          reportedById: ctx.session?.user?.id || null,
          status: 'REPORTED',
          updatedAt: new Date(),
        },
      });

      // Broadcast to all dispatchers in real-time
      try {
        await broadcastNewIncident({
          id: incident.id,
          category: incident.category,
          severity: incident.severity,
          latitude: incident.latitude,
          longitude: incident.longitude,
          region: incident.region,
          title: incident.title,
        });
      } catch (error) {
        console.error('Pusher notification error:', error);
      }

      // Create audit log if user is logged in
      if (ctx.session?.user) {
        await ctx.prisma.audit_logs.create({
          data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            userId: ctx.session.user.id,
            action: 'CREATE_INCIDENT',
            entity: 'Incident',
            entityId: incident.id,
          },
        });
      }

      return incident;
    }),

  create: protectedProcedure.input(createIncidentSchema).mutation(async ({ input, ctx }) => {
    // Calculate region and district from coordinates
    const region = getRegionFromCoordinates(input.latitude, input.longitude) || 'Unknown Region';
    const district = getDistrictFromCoordinates(input.latitude, input.longitude);

    // Remove region and district from input (we calculate them)
    const { region: _, district: __, ...incidentData } = input;

    const incident = await ctx.prisma.incidents.create({
      data: {
        id: `incident-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        ...incidentData,
        region,
        district,
        updatedAt: new Date(),
        reportedById: ctx.session.user.id,
        status: IncidentStatus.REPORTED,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
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
        action: 'incident_created',
        entity: 'Incident',
        entityId: incident.id,
        changes: { severity: input.severity, category: input.category },
      },
    });

    // Notify relevant agencies for critical/high severity incidents
    if (input.severity === IncidentSeverity.CRITICAL || input.severity === IncidentSeverity.HIGH) {
      // Find nearby agencies
      const nearbyAgencies = await ctx.prisma.agencies.findMany({
        where: {
          isActive: true,
          type: {
            in: ['AMBULANCE', 'FIRE_SERVICE', 'POLICE', 'NADMO'],
          },
        },
      });

      // Notify agencies (in a real implementation, you'd filter by distance)
      for (const agency of nearbyAgencies.slice(0, 5)) {
        // Limit to 5 agencies to avoid spam
        await sendToAgency(agency.id, {
          type: NotificationType.INCIDENT_CREATED,
          title: `New ${input.severity} Incident`,
          message: `${input.title} - ${input.category} in ${input.district}`,
          relatedEntityType: 'incident',
          relatedEntityId: incident.id,
          priority: input.severity === IncidentSeverity.CRITICAL ? 'critical' : 'high',
        });
      }
    }

    // Broadcast to all dispatchers in real-time
    try {
      await broadcastNewIncident({
        id: incident.id,
        category: incident.category,
        severity: incident.severity,
        latitude: incident.latitude,
        longitude: incident.longitude,
        region: incident.region,
        title: incident.title,
      });
    } catch (error) {
      console.error('Pusher notification error:', error);
      // Don't fail the request if Pusher fails
    }

    return incident;
  }),

  getAll: protectedProcedure.input(incidentFiltersSchema).query(async ({ input, ctx }) => {
    // Cache frequently accessed queries (5 minutes)
    return cachedQuery(
      'incidents.getAll',
      { input, userId: ctx.session.user.id, role: ctx.session.user.role },
      async () => {
        const where: any = {};

        // Apply filters
        if (input.status) where.status = input.status;
        if (input.severity) where.severity = input.severity;
        if (input.category) where.category = input.category;
        if (input.region) where.region = input.region;
        if (input.district) where.district = input.district;
        if (input.assignedAgencyId) where.assignedAgencyId = input.assignedAgencyId;
        if (input.reportedById) where.reportedById = input.reportedById;

        // Role-based filtering
        if (ctx.session.user.role === 'CITIZEN') {
          where.reportedById = ctx.session.user.id;
        } else if (ctx.session.user.role === 'AGENCY_ADMIN' && ctx.session.user.agencyId) {
          where.assignedAgencyId = ctx.session.user.agencyId;
        }

        const [incidents, total] = await Promise.all([
          ctx.prisma.incidents.findMany({
            where,
            include: {
              users: {
                select: { id: true, name: true, email: true },
              },
              agencies: {
                select: { id: true, name: true, type: true },
              },
            },
            orderBy: {
              [input.sortBy]: input.sortOrder,
            },
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize,
          }),
          ctx.prisma.incidents.count({ where }),
        ]);

        return {
          incidents,
          pagination: {
            page: input.page,
            pageSize: input.pageSize,
            total,
            totalPages: Math.ceil(total / input.pageSize),
          },
        };
      },
      300000 // 5 minutes cache
    );
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const incident = await ctx.prisma.incidents.findUnique({
        where: { id: input.id },
        include: {
          users: {
            select: { id: true, name: true, email: true, phone: true },
          },
          agencies: {
            select: { id: true, name: true, type: true, contactPhone: true },
          },
          dispatch_assignments: {
            include: {
              users: {
                select: { id: true, name: true, email: true },
              },
              agencies: {
                select: { id: true, name: true },
              },
            },
          },
          messages: {
            include: {
              users: {
                select: { id: true, name: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      // Check access permissions (convert to plain object for type check)
      const incidentPlain = {
        id: incident.id,
        reportedById: incident.reportedById,
        assignedAgencyId: incident.assignedAgencyId,
      };
      if (!canAccessIncident(ctx.session.user, incidentPlain as any)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this incident',
        });
      }

      return incident;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        data: updateIncidentSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const incident = await ctx.prisma.incidents.findUnique({
        where: { id: input.id },
      });

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      const incidentPlain = {
        id: incident.id,
        reportedById: incident.reportedById,
        assignedAgencyId: incident.assignedAgencyId,
      };
      if (!canEditIncident(ctx.session.user, incidentPlain as any)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to edit this incident',
        });
      }

      const updated = await ctx.prisma.incidents.update({
        where: { id: input.id },
        data: input.data,
      });

      // Create audit log
      await ctx.prisma.audit_logs.create({
        data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: ctx.session.user.id,
          action: 'incident_updated',
          entity: 'Incident',
          entityId: input.id,
          changes: input.data,
        },
      });

      // Invalidate caches
      invalidateCache('trpc:query:incidents.*');
      invalidateQueryCache('incidents.getActive');
      invalidateQueryCache('incidents.getActiveForMap');

      return updated;
    }),

  updateStatus: dispatcherProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.nativeEnum(IncidentStatus),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const incident = await ctx.prisma.incidents.findUnique({
        where: { id: input.id },
      });

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      const updateData: any = { status: input.status };

      if (input.status === IncidentStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      } else if (input.status === IncidentStatus.CLOSED) {
        updateData.closedAt = new Date();
      }

      const updated = await ctx.prisma.incidents.update({
        where: { id: input.id },
        data: updateData,
      });

      // Add update record
      await ctx.prisma.incident_updates.create({
        data: {
          id: `update-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          incidentId: input.id,
          userId: ctx.session.user.id,
          updateType: 'STATUS_CHANGE',
          content: `Status changed to ${input.status}`,
        },
      });

      // Broadcast update
      try {
        await broadcastIncidentUpdate(input.id, {
          status: input.status,
        });
      } catch (error) {
        console.error('Pusher update error:', error);
      }

      // Create audit log
      await ctx.prisma.audit_logs.create({
        data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: ctx.session.user.id,
          action: 'incident_status_changed',
          entity: 'Incident',
          entityId: input.id,
          changes: { status: input.status },
        },
      });

      // Invalidate caches
      invalidateCache('trpc:query:incidents.*');
      invalidateQueryCache('incidents.getActive');
      invalidateQueryCache('incidents.getActiveForMap');

      return updated;
    }),

  assignAgency: dispatcherProcedure
    .input(
      z.object({
        incidentId: z.string().cuid(),
        agencyId: z.string().cuid(),
        priority: z.number().int().min(1).max(5).optional().default(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [incident, agency] = await Promise.all([
        ctx.prisma.incidents.findUnique({ where: { id: input.incidentId } }),
        ctx.prisma.agencies.findUnique({ where: { id: input.agencyId } }),
      ]);

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      if (!agency || !agency.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Agency not found or inactive',
        });
      }

      const updated = await ctx.prisma.incidents.update({
        where: { id: input.incidentId },
        data: {
          assignedAgencyId: input.agencyId,
          status: IncidentStatus.DISPATCHED,
          dispatchedAt: new Date(),
          priority: input.priority,
        },
      });

      // Broadcast update
      try {
        await broadcastIncidentUpdate(input.incidentId, {
          status: 'DISPATCHED',
          assignedAgencyId: input.agencyId,
          dispatchedAt: new Date(),
        });
      } catch (error) {
        console.error('Pusher update error:', error);
      }

      // Invalidate caches
      invalidateCache('trpc:query:incidents.*');
      invalidateQueryCache('incidents.getActive');
      invalidateQueryCache('incidents.getActiveForMap');

      // Create audit log
      await ctx.prisma.audit_logs.create({
        data: {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: ctx.session.user.id,
          action: 'ASSIGN_AGENCY',
          entity: 'Incident',
          entityId: input.incidentId,
          changes: { agencyId: input.agencyId },
        },
      });

      return updated;
    }),

  getNearby: protectedProcedure.input(nearbyIncidentsSchema).query(async ({ input, ctx }) => {
    // Get all active incidents
    const incidents = await ctx.prisma.incidents.findMany({
      where: {
        status: {
          not: IncidentStatus.CLOSED,
        },
      },
      include: {
        agencies: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    // Filter by distance
    const nearby = incidents
      .map((incident) => ({
        ...incident,
        distance: calculateDistance(
          input.latitude,
          input.longitude,
          incident.latitude,
          incident.longitude
        ),
      }))
      .filter((incident) => incident.distance <= input.radius)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    // Cache active incidents (1 minute - they change frequently)
    return cachedQuery(
      'incidents.getActive',
      { userId: ctx.session.user.id, role: ctx.session.user.role },
      async () => {
        const incidents = await ctx.prisma.incidents.findMany({
          where: {
            status: {
              not: IncidentStatus.CLOSED,
            },
          },
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
            category: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            district: true,
            region: true,
            agencies: {
              select: { id: true, name: true },
            },
          },
        });

        return incidents;
      },
      60000 // 1 minute cache (active incidents change frequently)
    );
  }),

  // Get active incidents for map (optimized)
  getActiveForMap: protectedProcedure.query(async ({ ctx }) => {
    // Cache map incidents (30 seconds - real-time updates via Pusher)
    return cachedQuery(
      'incidents.getActiveForMap',
      {},
      async () => {
        const incidents = await ctx.prisma.incidents.findMany({
          where: {
            status: {
              in: ['REPORTED', 'DISPATCHED', 'IN_PROGRESS'],
            },
          },
          select: {
            id: true,
            category: true,
            severity: true,
            latitude: true,
            longitude: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return incidents;
      },
      30000 // 30 seconds cache (real-time updates via Pusher)
    );
  }),

  getUpdates: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const incident = await ctx.prisma.incidents.findUnique({
        where: { id: input.id },
      });

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      // Check access
      const incidentPlain = {
        id: incident.id,
        reportedById: incident.reportedById,
        assignedAgencyId: incident.assignedAgencyId,
      };
      if (!canAccessIncident(ctx.session.user, incidentPlain as any)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this incident',
        });
      }

      const updates = await ctx.prisma.incident_updates.findMany({
        where: { incidentId: input.id },
        include: {
          users: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return updates;
    }),

  addUpdate: protectedProcedure
    .input(
      z.object({
        incidentId: z.string().cuid(),
        updateType: z.enum(['general', 'responder', 'media']),
        content: z.string().min(1),
        mediaUrls: z.array(z.string().url()).default([]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const incident = await ctx.prisma.incidents.findUnique({
        where: { id: input.incidentId },
      });

      if (!incident) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Incident not found',
        });
      }

      // Check access
      const incidentPlain = {
        id: incident.id,
        reportedById: incident.reportedById,
        assignedAgencyId: incident.assignedAgencyId,
      };
      if (!canAccessIncident(ctx.session.user, incidentPlain as any)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this incident',
        });
      }

      // Map frontend updateType to Prisma UpdateType enum
      const updateTypeMap: Record<
        'general' | 'responder' | 'media',
        'NOTE_ADDED' | 'RESPONDER_UPDATE' | 'MEDIA_ADDED'
      > = {
        general: 'NOTE_ADDED',
        responder: 'RESPONDER_UPDATE',
        media: 'MEDIA_ADDED',
      };

      const update = await ctx.prisma.incident_updates.create({
        data: {
          id: `update-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          incidentId: input.incidentId,
          userId: ctx.session.user.id,
          updateType: updateTypeMap[input.updateType],
          content: input.content,
          metadata:
            input.mediaUrls.length > 0 ? ({ mediaUrls: input.mediaUrls } as any) : undefined,
        },
        include: {
          users: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      return update;
    }),
});
