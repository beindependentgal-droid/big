// Simple service worker for basic PWA offline support
const CACHE_NAME = 'big-pwa-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// For navigation requests (SPA) try network first then fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/', copy));
        }
        return resp;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other requests, use cache-first for same-origin assets
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return resp;
      })).catch(() => cached)
    );
  }
});
