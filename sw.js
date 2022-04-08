const cacheName = 'Bröllopsfotografen';
const cacheAssets = [
  '/index.html',
  '/styles.css',
  '/script.js',
  '/assets/icon-camera.svg',
  '/assets/icon-gallery.svg',
  '/imagefilters.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => cache.addAll(cacheAssets))
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
