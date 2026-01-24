// Nom du cache (change la version pour forcer la mise à jour)
const CACHE_VERSION = "v5-fasd";
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Fichiers statiques à mettre en cache
const STATIC_ASSETS = [
  "/styles.css",
  "/main.js",
  "/manifest.json",
  "/assets/logo.svg"
];

// INSTALLATION — Pré-cache des assets statiques
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATION — Nettoyage des anciens caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH — Stratégie :
// ❌ jamais de cache pour HTML
// ❌ jamais de cache pour Supabase
// ✔ cache-first pour CSS/JS/images
self.addEventListener("fetch", event => {
  const request = event.request;

  // Ne jamais mettre en cache Supabase
  if (request.url.includes("supabase.co")) {
    event.respondWith(fetch(request));
    return;
  }

  // Ne jamais mettre en cache les pages HTML
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(fetch(request).catch(() => fetch("/index.html")));
    return;
  }

  // Cache-first pour les assets
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request).then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
      );
    })
  );
});
