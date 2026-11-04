const CACHE_NAME = 'rakka-v1';
const ASSETS = [
  './index.html?app=rakka&v=1',
  './manifest.json?v=1',
  './icon-192.png?v=1',
  './icon-512.png?v=1',
  './apple-touch-icon.png?v=1',
  './favicon.png?v=1',
  './logo-1024.png?v=1',
  './staples_catalog.json?v=1'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Rakka pre-cache item missing or failed:', err);
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Cache-first for local static assets
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first with cache fallback for openFDA / barcode lookups
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
