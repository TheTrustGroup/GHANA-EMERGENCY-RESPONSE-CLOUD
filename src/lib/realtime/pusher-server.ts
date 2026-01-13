/**
 * MILITARY-GRADE Real-Time Integration Layer
 * Server-side Pusher configuration and broadcast functions
 */

import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// ============================================
// REAL-TIME EVENT BROADCASTERS
// ============================================

export async function broadcastNewIncident(incident: {
  id: string;
  category: string;
  severity: string;
  latitude: number;
  longitude: number;
  region: string;
  title: string;
}) {
  // Broadcast to ALL dispatchers and admins
  await pusherServer.trigger('incidents-global', 'incident-created', {
    id: incident.id,
    category: incident.category,
    severity: incident.severity,
    latitude: incident.latitude,
    longitude: incident.longitude,
    region: incident.region,
    title: incident.title,
    timestamp: new Date().toISOString(),
  });

  // If CRITICAL, also broadcast to regional channel
  if (incident.severity === 'CRITICAL') {
    await pusherServer.trigger(
      `incidents-${incident.region.replace(/\s+/g, '-').toLowerCase()}`,
      'critical-incident',
      incident
    );
  }
}

export async function broadcastIncidentUpdate(incidentId: string, update: {
  status?: string;
  assignedAgencyId?: string;
  dispatchedAt?: Date;
}) {
  await pusherServer.trigger(
    `incident-${incidentId}`,
    'incident-updated',
    {
      incidentId,
      ...update,
      timestamp: new Date().toISOString(),
    }
  );

  // Also broadcast to global feed
  await pusherServer.trigger(
    'incidents-global',
    'incident-updated',
    { incidentId, ...update }
  );
}

export async function broadcastDispatchAssignment(dispatch: {
  id: string;
  incidentId: string;
  responderId: string;
  agencyId: string;
  status: string;
}) {
  // Notify the specific responder
  await pusherServer.trigger(
    `user-${dispatch.responderId}`,
    'dispatch-assigned',
    dispatch
  );

  // Update incident channel
  await pusherServer.trigger(
    `incident-${dispatch.incidentId}`,
    'dispatch-created',
    dispatch
  );

  // Update agency channel
  await pusherServer.trigger(
    `agency-${dispatch.agencyId}`,
    'dispatch-created',
    dispatch
  );
}

export async function broadcastResponderLocation(
  responderId: string,
  location: { latitude: number; longitude: number }
) {
  await pusherServer.trigger(
    `responder-${responderId}`,
    'location-updated',
    {
      responderId,
      ...location,
      timestamp: new Date().toISOString(),
    }
  );
}

export async function broadcastSystemAlert(alert: {
  severity: string;
  title: string;
  message: string;
  targetRoles?: string[];
}) {
  await pusherServer.trigger(
    'system-alerts',
    'alert',
    {
      ...alert,
      timestamp: new Date().toISOString(),
    }
  );
}
