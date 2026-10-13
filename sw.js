const CACHE_NAME = 'jadwal-pwa-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './datajadwal.csv',
  './logo.svg',
  './manifest.json',
  './js/main.js',
  './js/application/scheduleService.js',
  './js/data/presetRepository.js',
  './js/data/scheduleRepository.js',
  './js/domain/schedule.js',
  './js/presentation/scheduleView.js',
  './js/presentation/sidebar.js',
  './js/presentation/theme.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
