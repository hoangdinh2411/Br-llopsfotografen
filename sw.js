const cacheName = 'Bröllopsfotografen';
const cacheAssets = [
  '/src/index.html',
  '/src/styles.css',
  '/src/script.js',
  '/src/assets/icon-camera.svg',
  '/src/assets/icon-gallery.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => cache.addAll(cacheAssets))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => { 
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches
      .match(e.request)
      .then((resp) => resp || fetch(e.request))
  );
});
