/**
 * Offline Queue System
 * Queues operations when offline and syncs when connection returns
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { toast } from 'sonner';

interface OfflineDB extends DBSchema {
  'incident-queue': {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
      retries: number;
      endpoint: string;
      method: string;
    };
  };
  'status-updates': {
    key: string;
    value: {
      id: string;
      dispatchId: string;
      status: string;
      timestamp: number;
      retries: number;
    };
  };
}

let dbInstance: IDBPDatabase<OfflineDB> | null = null;

/**
 * Initialize IndexedDB
 */
async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<OfflineDB>('gercc-offline', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('incident-queue')) {
        db.createObjectStore('incident-queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('status-updates')) {
        db.createObjectStore('status-updates', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

/**
 * Queue an incident report for offline submission
 */
export async function queueIncident(data: any): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Offline queue only works in browser');
  }

  try {
    const db = await getDB();
    const id = crypto.randomUUID();

    await db.put('incident-queue', {
      id,
      data,
      timestamp: Date.now(),
      retries: 0,
      endpoint: '/api/trpc/incidents.create',
      method: 'POST',
    });

    toast.info('Saved offline. Will send when connection returns.');
    return id;
  } catch (error) {
    console.error('Failed to queue incident:', error);
    throw error;
  }
}

/**
 * Queue a status update for offline submission
 */
export async function queueStatusUpdate(
  dispatchId: string,
  status: string
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Offline queue only works in browser');
  }

  try {
    const db = await getDB();
    const id = crypto.randomUUID();

    await db.put('status-updates', {
      id,
      dispatchId,
      status,
      timestamp: Date.now(),
      retries: 0,
    });

    return id;
  } catch (error) {
    console.error('Failed to queue status update:', error);
    throw error;
  }
}

/**
 * Sync all queued items when connection returns
 */
export async function syncOfflineQueue(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  if (!navigator.onLine) {
    return;
  }

  try {
    const db = await getDB();

    // Sync incident queue
    const incidents = await db.getAll('incident-queue');
    for (const item of incidents) {
      try {
        const response = await fetch(item.endpoint, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          await db.delete('incident-queue', item.id);
          toast.success('Offline report sent successfully');
        } else {
          // Increment retry count
          item.retries++;
          if (item.retries > 3) {
            // Max retries - notify user
            toast.error('Failed to send report. Please try again later.');
            await db.delete('incident-queue', item.id);
          } else {
            await db.put('incident-queue', item);
          }
        }
      } catch (error) {
        console.error('Failed to sync incident:', error);
        item.retries++;
        if (item.retries <= 3) {
          await db.put('incident-queue', item);
        } else {
          await db.delete('incident-queue', item.id);
        }
      }
    }

    // Sync status updates
    const statusUpdates = await db.getAll('status-updates');
    for (const item of statusUpdates) {
      try {
        const response = await fetch(`/api/trpc/dispatch.updateStatus`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dispatchId: item.dispatchId,
            status: item.status,
          }),
        });

        if (response.ok) {
          await db.delete('status-updates', item.id);
        } else {
          item.retries++;
          if (item.retries > 3) {
            await db.delete('status-updates', item.id);
          } else {
            await db.put('status-updates', item);
          }
        }
      } catch (error) {
        console.error('Failed to sync status update:', error);
        item.retries++;
        if (item.retries <= 3) {
          await db.put('status-updates', item);
        } else {
          await db.delete('status-updates', item.id);
        }
      }
    }
  } catch (error) {
    console.error('Failed to sync offline queue:', error);
  }
}

/**
 * Get count of queued items
 */
export async function getQueueCount(): Promise<{
  incidents: number;
  statusUpdates: number;
}> {
  if (typeof window === 'undefined') {
    return { incidents: 0, statusUpdates: 0 };
  }

  try {
    const db = await getDB();
    const incidents = await db.count('incident-queue');
    const statusUpdates = await db.count('status-updates');

    return { incidents, statusUpdates };
  } catch (error) {
    console.error('Failed to get queue count:', error);
    return { incidents: 0, statusUpdates: 0 };
  }
}

// Auto-sync when connection returns
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineQueue();
  });

  // Also sync on page load if online
  if (navigator.onLine) {
    // Delay to ensure app is ready
    setTimeout(() => {
      syncOfflineQueue();
    }, 2000);
  }
}
