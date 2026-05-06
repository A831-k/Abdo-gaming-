const CACHE_NAME = 'abdo-gaming-v2';
const ASSETS = [
  'index.html',
  'games.json',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap'
];

// تثبيت وتخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// حذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// استراتيجية: Network First لـ games.json، Cache First للباقي
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // games.json: حاول تجيب أحدث نسخة، ولو فشل استخدم الكاش
  if (url.pathname.endsWith('games.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // الباقي: Cache First
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
