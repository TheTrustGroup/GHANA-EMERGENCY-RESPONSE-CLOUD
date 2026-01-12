/**
 * Service Worker for Offline Support
 * MILITARY-GRADE offline-first design
 */

const CACHE_NAME = 'gercc-v1';
const urlsToCache = [
  '/',
  '/report',
  '/dashboard',
  '/offline.html',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // If network fails, return offline page
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Background sync for queued operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-incidents') {
    event.waitUntil(syncQueuedIncidents());
  }
});

async function syncQueuedIncidents() {
  try {
    // Open IndexedDB
    const db = await openDB('gercc-offline');
    const queue = await db.getAll('incident-queue');
    
    for (const item of queue) {
      try {
        const response = await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          await db.delete('incident-queue', item.id);
        }
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Helper to open IndexedDB
function openDB(name) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('incident-queue')) {
        db.createObjectStore('incident-queue', { keyPath: 'id' });
      }
    };
  });
}
