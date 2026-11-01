const CACHE_NAME = 'safebite-v1';
const ASSETS = [
  './index.html?app=safebite',
  './manifest.json?v=3',
  './icon-192.png?v=3',
  './icon-512.png?v=3',
  './apple-touch-icon.png?v=3',
  './favicon.png?v=3'
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
