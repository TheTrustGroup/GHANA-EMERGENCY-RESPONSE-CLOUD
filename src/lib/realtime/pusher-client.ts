/**
 * MILITARY-GRADE Real-Time Integration Layer
 * Client-side Pusher configuration and React hooks
 */

'use client';

import PusherClient from 'pusher-js';
import { useEffect } from 'react';

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);

// ============================================
// REACT HOOKS FOR REAL-TIME SUBSCRIPTIONS
// ============================================

export function useIncidentUpdates(callback: (data: any) => void) {
  useEffect(() => {
    const channel = pusherClient.subscribe('incidents-global');

    channel.bind('incident-created', callback);
    channel.bind('incident-updated', callback);

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [callback]);
}

export function useDispatchUpdates(
  responderId: string,
  callback: (data: any) => void
) {
  useEffect(() => {
    if (!responderId) return;

    const channel = pusherClient.subscribe(`user-${responderId}`);

    channel.bind('dispatch-assigned', callback);

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [responderId, callback]);
}

export function useResponderTracking(
  responderId: string,
  callback: (location: { latitude: number; longitude: number }) => void
) {
  useEffect(() => {
    if (!responderId) return;

    const channel = pusherClient.subscribe(`responder-${responderId}`);

    channel.bind('location-updated', callback);

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [responderId, callback]);
}

export function useSystemAlerts(callback: (alert: any) => void) {
  useEffect(() => {
    const channel = pusherClient.subscribe('system-alerts');

    channel.bind('alert', callback);

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [callback]);
}
