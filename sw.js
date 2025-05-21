const CACHE_NAME = 'glucose-logger-v1.5'; // Incremented version
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // JS/TSX files
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/useLocalStorage.ts',
  '/components/GlucoseForm.tsx',
  '/components/ReadingsList.tsx',
  '/components/NotificationBanner.tsx',
  '/components/ExportControls.tsx',
  // CDNs
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react@^19.1.0/jsx-runtime',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/react-dom@^19.1.0/',
  'https://esm.sh/react@^19.1.0/',

  // Placeholder icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon-180x180.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching files:', urlsToCache);
        const cachePromises = urlsToCache.map(urlToCache => {
          const request = new Request(urlToCache, { cache: 'reload' });
          return fetch(request).then(response => {
            if (!response.ok) {
              console.warn(`Failed to fetch ${urlToCache} for caching: ${response.status} ${response.statusText}`);
               if (response.status === 0) { 
                 return cache.put(request, response);
              }
              return Promise.resolve(); 
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
          return null;
        })
      );
    }).then(() => self.clients.claim()) 
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(
          (networkResponse) => {
            if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque') || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors' && networkResponse.type !== 'opaque') ) {
               if (networkResponse && networkResponse.status === 0 && networkResponse.type === 'opaque') {
                  // Opaque response, cache it
               } else {
                  return networkResponse;
               }
            }
            
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        ).catch((error) => {
          console.warn('Fetch failed for:', event.request.url, error);
          // Consider returning a generic offline page here for navigation requests
        });
      })
  );
});
