
const CACHE_NAME = 'glucose-logger-v1.2'; // Incremented version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // JS/TSX files (Note: these are source files, in a real build system, you'd cache built bundles)
  // For esm.sh based imports, the browser resolves them, but we cache the main entry points & common deps.
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/useLocalStorage.ts',
  '/components/GlucoseForm.tsx',
  '/components/ReadingsList.tsx',
  '/components/NotificationBanner.tsx',
  // CDNs
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react@^19.1.0/jsx-runtime',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/react-dom@^19.1.0/',
  'https://esm.sh/react@^19.1.0/',


  // Placeholder icons (ensure these paths exist in a real deployment in an /icons/ folder)
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon-180x180.png' // Make sure this exists for apple-touch-icon link
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate new service worker as soon as it's finished installing
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching files:', urlsToCache);
        // Use { cache: 'reload' } to bypass HTTP cache for these initial assets
        const cachePromises = urlsToCache.map(urlToCache => {
          const request = new Request(urlToCache, { cache: 'reload' });
          return fetch(request).then(response => {
            if (!response.ok) {
              // For CDN or external resources, a failure might not be critical for the app shell
              // but log it for debugging.
              console.warn(`Failed to fetch ${urlToCache} for caching: ${response.status} ${response.statusText}`);
              // Don't put bad responses in cache
              if (response.status === 0) { // Opaque responses (like from no-cors requests)
                // We can't check if they are ok, but for CDNs, we often have to accept them.
                // However, esm.sh should provide CORS headers.
                 return cache.put(request, response);
              }
              return Promise.resolve(); // Don't let one failed resource stop others
            }
            return cache.put(request, response);
          }).catch(error => {
            console.warn(`Error fetching and caching ${urlToCache}:`, error);
          });
        });
        return Promise.all(cachePromises);
      })
      .catch(err => {
        console.error('Cache open/addAll failed during install:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of uncontrolled clients
  );
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle requests for extensions (e.g. chrome-extension://)
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  // For esm.sh and other CDNs, network-first or cache-first with refresh can be good.
  // For app assets, cache-first is generally fine.
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response
            // Allow opaque responses for CDNs as we can't inspect them
            if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque') || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors' && networkResponse.type !== 'opaque') ) {
               if (networkResponse && networkResponse.status === 0 && networkResponse.type === 'opaque') {
                  // This is an opaque response, typically from a CDN with no-cors mode.
                  // We can cache it but can't verify its content or status.
               } else {
                  // Not a good response to cache, or it failed.
                  return networkResponse;
               }
            }
            
            // Clone the response. A response is a stream and can only be consumed once.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch((error) => {
          console.warn('Fetch failed; returning offline fallback or letting browser handle for:', event.request.url, error);
          // Optionally, you could return a generic offline page here if it's a navigation request:
          // if (event.request.mode === 'navigate') {
          //   return caches.match('/offline.html'); // You would need an offline.html cached
          // }
        });
      })
  );
});
