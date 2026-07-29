const CACHE_NAME = 'lecturesafe-v2';

// List of files to cache for offline access
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './favicon-light.svg',
  './favicon-dark.svg',
  './icon-192.png',
  './icon-512.png'
];

// Cache essential files during Service Worker installation
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened successfully.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached files for offline access and faster load times
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if available, otherwise fetch from the network
        return response || fetch(event.request);
      })
  );
});

// Clean up outdated caches during Service Worker activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
