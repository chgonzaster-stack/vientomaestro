/* Viento Maestro - service worker */
const CACHE_VERSION = 'vm-v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const STATIC_ASSETS = [ '/', '/icons/icon-192.png', '/icons/icon-512.png' ];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (!k.includes(CACHE_VERSION)) return caches.delete(k);
    }))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname === '/' || url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request).then(resp => {
        const clone = resp.clone();
        caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
        return resp;
      }).catch(() => caches.match(request))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(resp => {
      const clone = resp.clone();
      caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
      return resp;
    }))
  );
});
