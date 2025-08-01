self.addEventListener("install", (event) => {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open("app-cache-v1").then((cache) => {
      console.log('SW: Cache opened');
      return cache.addAll([
        "/",
        "/index.html",
        "/admin.html",
        "/manifest.json"
      ]).catch(error => {
        console.error('SW: Cache addAll failed:', error);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== "app-cache-v1") {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Пропускаем API запросы и внешние ресурсы
  if (event.request.url.includes('/api/') ||
    event.request.url.includes('us-central1-coffeeaddict-c9d70.cloudfunctions.net') ||
    event.request.url.includes('chrome-extension') ||
    !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('SW: Serving from cache:', event.request.url);
        return response;
      }

      console.log('SW: Fetching from network:', event.request.url);
      return fetch(event.request).catch(error => {
        console.error('SW: Fetch failed:', error);
        // Возвращаем базовую страницу для навигационных запросов
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw error;
      });
    })
  );
});
