const CACHE_NAME = 'bitehound-v14';
const ASSETS = [
  './index.html?app=bitehound',
  './manifest.json?v=14',
  './icon-192.png?v=14',
  './icon-512.png?v=14',
  './apple-touch-icon.png?v=14',
  './favicon.png?v=14',
  './logo-1024.png?v=14',
  './staples_catalog.json?v=14'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((k) => { if (k !== CACHE_NAME) return caches.delete(k); })
    )).then(() => self.clients.claim())
  );
});

// Network-First for HTML navigation (updates load immediately when online; falls back to offline cache in store)
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((networkRes) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() => caches.match('./index.html?app=bitehound') || caches.match(e.request))
    );
    return;
  }

  // Cache-first for images and static assets
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
