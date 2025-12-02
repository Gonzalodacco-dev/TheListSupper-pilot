// Service Worker - The List Supper™ v2025.1 (Cache Control)
const APP_VERSION = '2025.1.0';
const CACHE_NAME = `the-list-supper-${APP_VERSION}`;
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', event => {
  console.log('🛠️ Service Worker instalado - The List Supper™ v' + APP_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Cacheando archivos:', urlsToCache);
      return cache.addAll(urlsToCache);
    })
  );
  // Forzar activación inmediata
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Primero, intentar con network, luego con cache
      return response || fetch(event.request).then(fetchResponse => {
        // Cachear nuevas respuestas
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Fallback para offline
      return caches.match('/index.html');
    })
  );
});

self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activado - Limpiando caches viejos');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar TODOS los caches viejos
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control inmediato de todos los clients
      return self.clients.claim();
    })
  );
});

// Permitir skipWaiting desde la página
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// ❌ ELIMINADO: Todo el código de notificaciones push