/* ===================================
   VOIDTUNE SERVICE WORKER (FIXED)
   Auto-updating + GitHub Pages safe
   =================================== */

const CACHE_VERSION = "v3"; // 🔥 CHANGE THIS EVERY UPDATE
const CACHE_NAME = `voidtune-${CACHE_VERSION}`;

// 🔥 IMPORTANT: Use relative paths (GitHub Pages friendly)
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  
  // External CDNs (cached but optional)
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// INSTALL
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v3');

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );

  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating');

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache', key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() => caches.match(event.request))
  );
});
