// RecallRadar Service Worker
const CACHE_NAME = 'recallradar-v3';
self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', (e) => {
  // Let network handle or pass through
});
