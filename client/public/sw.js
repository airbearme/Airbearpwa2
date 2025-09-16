const CACHE_NAME = 'airbear-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/airbear-mascot.png',
  '/airbear-mascot-original.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for offline ride bookings
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline ride bookings when connection is restored
  console.log('[SW] Performing background sync...');
  // In a real application, you would fetch failed requests from IndexedDB and retry them.
  // For this example, we'll just simulate a successful sync.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network activity
  console.log('[SW] Background sync completed.');
  return Promise.resolve();
}

// Push notifications for ride updates
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Your AirBear is arriving!',
    icon: '/airbear-mascot.png',
    badge: '/airbear-mascot.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Track AirBear',
        icon: '/airbear-mascot.png'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/airbear-mascot.png'
      },
    ],
    tag: 'ride-notification',
    renotify: true,
    requireInteraction: true
  };

  if (event.data) {
    try {
      const data = JSON.parse(event.data.text());
      options.body = data.body || options.body;
      options.data = { ...options.data, ...data };
      options.tag = data.tag || options.tag;
    } catch (error) {
      console.error('[SW] Failed to parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('AirBear Update', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    const url = event.notification.data?.url || '/dashboard';
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'close') {
    // No action needed, notification is already closed.
  }
});

console.log('[SW] Service Worker loaded');