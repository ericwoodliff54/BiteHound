const CACHE_NAME = 'recall-radar-v7';
const ASSETS = [
  './index.html?v=2',
  './manifest.json?v=2',
  './icon-192.png?v=2',
  './icon-512.png?v=2',
  './apple-touch-icon.png?v=2',
  './favicon.png?v=2'
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

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
