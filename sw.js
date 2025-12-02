// Service Worker - The List Supper™ v4 (SIN PERMISOS)
const CACHE_NAME = 'the-list-supper-tm-v4';
const urlsToCache = ['/','/index-prod.html'];

self.addEventListener('install', event => {
  console.log('🛠️ Service Worker instalado - Sin permisos molestos');
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activado');
  event.waitUntil(caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(cacheName => {
      if (cacheName !== CACHE_NAME) {
        return caches.delete(cacheName);
      }
    }));
  }));
});

// ❌ ELIMINADO: Todo el código de notificaciones push