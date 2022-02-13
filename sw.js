// service worker

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('planlekcji-plus2').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/plan.html',
      '/js/plan.js',
      '/css/style.css',
      '/css/dark-style.css',
      '/css/plan.css',
      '/css/dark-plan.css'
    ])),
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
