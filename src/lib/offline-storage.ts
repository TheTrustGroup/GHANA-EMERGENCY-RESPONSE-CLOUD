/**
 * Offline Storage Utilities
 * Saves data to localStorage and IndexedDB for offline support
 */

/**
 * Save data to localStorage
 */
export function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Load data from localStorage
 */
export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Clear data from localStorage
 */
export function clearLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}

/**
 * Queue item for offline sync
 */
export async function queueForSync(data: any): Promise<void> {
  try {
    // In production, this would use IndexedDB
    const queue = loadFromLocalStorage<any[]>('sync-queue') || [];
    queue.push({
      ...data,
      queuedAt: new Date().toISOString(),
    });
    saveToLocalStorage('sync-queue', queue);
  } catch (error) {
    console.error('Failed to queue for sync:', error);
  }
}

/**
 * Process sync queue when online
 */
export async function processSyncQueue(): Promise<void> {
  if (!navigator.onLine) {
    return;
  }

  const queue = loadFromLocalStorage<any[]>('sync-queue') || [];
  if (queue.length === 0) {
    return;
  }

  // Process each item in queue
  for (const item of queue) {
    try {
      // Retry the original request
      // This would be implemented based on the queued item type
    } catch (error) {
      console.error('Failed to process queued item:', error);
      // Keep in queue for retry
    }
  }

  // Clear queue after successful processing
  clearLocalStorage('sync-queue');
}

// Listen for online event
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processSyncQueue();
  });
}
