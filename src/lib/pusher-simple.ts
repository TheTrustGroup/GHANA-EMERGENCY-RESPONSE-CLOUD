/**
 * Simple Pusher Configuration
 * Real-time updates for incidents
 */

import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

// Client-side Pusher instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  }
);

/**
 * Notify about new incident (server-side)
 */
export async function notifyNewIncident(incident: {
  id: string;
  severity: string;
  category: string;
  latitude: number;
  longitude: number;
  title: string;
  status: string;
}) {
  try {
    await pusherServer.trigger('incidents', 'new-incident', incident);
  } catch (error) {
    console.error('Pusher notification error:', error);
  }
}

/**
 * Notify about incident update (server-side)
 */
export async function notifyIncidentUpdate(incident: {
  id: string;
  severity: string;
  category: string;
  latitude: number;
  longitude: number;
  title: string;
  status: string;
}) {
  try {
    await pusherServer.trigger('incidents', 'incident-updated', incident);
  } catch (error) {
    console.error('Pusher update error:', error);
  }
}

/**
 * Notify about incident resolution (server-side)
 */
export async function notifyIncidentResolved(incidentId: string) {
  try {
    await pusherServer.trigger('incidents', 'incident-resolved', { id: incidentId });
  } catch (error) {
    console.error('Pusher resolution error:', error);
  }
}
