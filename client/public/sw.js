const CACHE_NAME = 'airbear-v1.0.0';
const STATIC_CACHE = 'airbear-static-v1.0.0';
const DYNAMIC_CACHE = 'airbear-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/index.css',
  // Core app routes
  '/map',
  '/bodega',
  '/dashboard',
  '/auth',
  // External dependencies that should be cached
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
];

// API endpoints that should be cached with network-first strategy
const API_ENDPOINTS = [
  '/api/spots',
  '/api/bodega/items',
  '/api/rickshaws/available',
  '/api/analytics/overview',
];

// Dynamic content that should be cached
const DYNAMIC_URLS = [
  '/api/rides/',
  '/api/orders/',
  '/api/users/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
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
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName.startsWith('airbear-');
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
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(url)) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request));
  } else if (isAPIEndpoint(url)) {
    // Network first for API endpoints
    event.respondWith(networkFirst(request));
  } else if (isDynamicContent(url)) {
    // Stale while revalidate for dynamic content
    event.respondWith(staleWhileRevalidate(request));
  } else if (isNavigationRequest(request)) {
    // Network first with offline fallback for navigation
    event.respondWith(navigationHandler(request));
  } else {
    // Default to network with cache fallback
    event.respondWith(networkWithCacheFallback(request));
  }
});

// Caching strategy implementations
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network first falling back to cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No cached data available' }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

async function navigationHandler(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation request failed, serving offline page');
    const cache = await caches.open(STATIC_CACHE);
    const offlineResponse = await cache.match('/');
    return offlineResponse || new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>AirBear - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            }
            .logo { 
              width: 80px; 
              height: 80px; 
              margin: 0 auto 20px; 
              border: 4px solid #10b981; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              background: white;
            }
            .wheel { 
              width: 40px; 
              height: 40px; 
              border: 3px solid #84cc16; 
              border-radius: 50%; 
              position: relative; 
            }
            .wheel::before, .wheel::after { 
              content: ''; 
              position: absolute; 
              background: #84cc16; 
              top: 50%; 
              left: 50%; 
              transform: translate(-50%, -50%); 
            }
            .wheel::before { width: 20px; height: 2px; }
            .wheel::after { width: 2px; height: 20px; }
            h1 { color: #10b981; margin-bottom: 10px; }
            p { color: #6b7280; margin-bottom: 20px; }
            button { 
              background: #10b981; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 8px; 
              cursor: pointer; 
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="logo">
            <div class="wheel"></div>
          </div>
          <h1>You're Offline</h1>
          <p>AirBear needs an internet connection to access the latest ride and bodega information.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

async function networkWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Helper functions to categorize requests
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname === asset) ||
         url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/);
}

function isAPIEndpoint(url) {
  return API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

function isDynamicContent(url) {
  return DYNAMIC_URLS.some(pattern => url.pathname.startsWith(pattern));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'ride-booking') {
    event.waitUntil(syncFailedRideBookings());
  } else if (event.tag === 'order-submission') {
    event.waitUntil(syncFailedOrders());
  }
});

async function syncFailedRideBookings() {
  try {
    const failedBookings = await getFailedRequests('ride-bookings');
    for (const booking of failedBookings) {
      try {
        await fetch('/api/rides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(booking.data)
        });
        await removeFailedRequest('ride-bookings', booking.id);
        console.log('[SW] Successfully synced ride booking:', booking.id);
      } catch (error) {
        console.error('[SW] Failed to sync ride booking:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function syncFailedOrders() {
  try {
    const failedOrders = await getFailedRequests('orders');
    for (const order of failedOrders) {
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order.data)
        });
        await removeFailedRequest('orders', order.id);
        console.log('[SW] Successfully synced order:', order.id);
      } catch (error) {
        console.error('[SW] Failed to sync order:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Your AirBear ride is arriving soon!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/dashboard'
    },
    actions: [
      {
        action: 'view',
        title: 'View Ride',
        icon: '/icon-view.png'
      },
      {
        action: 'cancel',
        title: 'Cancel',
        icon: '/icon-cancel.png'
      }
    ],
    tag: 'ride-notification',
    renotify: true,
    requireInteraction: true
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.data = { ...options.data, ...data };
    } catch (error) {
      console.error('[SW] Failed to parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('AirBear', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    const url = event.notification.data?.url || '/dashboard';
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'cancel') {
    // Handle ride cancellation
    event.waitUntil(
      fetch('/api/rides/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId: event.notification.data?.rideId })
      })
    );
  }
});

// Utility functions for IndexedDB operations
async function getFailedRequests(type) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AirBearOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([type], 'readonly');
      const store = transaction.objectStore(type);
      const getRequest = store.getAll();
      
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(type)) {
        db.createObjectStore(type, { keyPath: 'id' });
      }
    };
  });
}

async function removeFailedRequest(type, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AirBearOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([type], 'readwrite');
      const store = transaction.objectStore(type);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Cache size management
setInterval(async () => {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  
  // Remove old entries if cache is too large (max 50 items)
  if (requests.length > 50) {
    const oldestRequests = requests.slice(0, requests.length - 50);
    await Promise.all(oldestRequests.map(request => cache.delete(request)));
    console.log('[SW] Cleaned up old cache entries');
  }
}, 300000); // Run every 5 minutes

console.log('[SW] Service Worker loaded');
