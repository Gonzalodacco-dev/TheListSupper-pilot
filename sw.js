// Service Worker - The List Supper™ v2025.2.0 (Cache Killer Edition)
const APP_VERSION = '2025.2.0';
const CACHE_NAME = `list-supper-${APP_VERSION}`;

// ARCHIVOS CRÍTICOS - SOLO LO ESENCIAL
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  console.log(`🛠️ SW v${APP_VERSION} instalando...`);
  
  // SKIP WAITING INMEDIATAMENTE - No esperar a activarse
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cacheando assets críticos:', CRITICAL_ASSETS);
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('✅ Instalación completada');
      })
  );
});

self.addEventListener('activate', event => {
  console.log(`🚀 SW v${APP_VERSION} activado - Limpieza nuclear`);
  
  event.waitUntil(
    Promise.all([
      // 1. ELIMINAR TODOS los caches viejos SIN EXCEPCIÓN
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log(`🗑️ ELIMINANDO CACHE VIEJO: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // 2. TOMAR CONTROL INMEDIATO de todas las pestañas
      self.clients.claim(),
      
      // 3. Notificar a todos los clients que se actualicen
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: APP_VERSION
          });
        });
      })
    ]).then(() => {
      console.log('🔥 Activación nuclear completada');
    })
  );
});

self.addEventListener('fetch', event => {
  // ESTRATEGIA: Network First, THEN cache
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si hay respuesta de red, actualizar cache
        if (event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback a cache SOLO si falla la red
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse || caches.match('/index.html');
          });
      })
  );
});

// COMUNICACIÓN CON LA PÁGINA
self.addEventListener('message', event => {
  switch (event.data) {
    case 'skipWaiting':
      self.skipWaiting();
      break;
      
    case 'getVersion':
      event.ports[0].postMessage({ version: APP_VERSION });
      break;
      
    case 'clearAllCaches':
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
        event.ports[0].postMessage({ cleared: keys.length });
      });
      break;
  }
});

console.log(`⚡ The List Supper™ Service Worker v${APP_VERSION} cargado`);