// Nom du cache (change la version pour forcer la mise à jour)
const CACHE_VERSION = "v4-fasd";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Fichiers statiques à mettre en cache
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.js",
  "/manifest.json",
  "/assets/logo.svg",
  "/physique-actu.html",
  "/physique-presse.html",
  "/intellectuelle-actu.html",
  "/intellectuelle-presse.html",
  "/projets.html",
  "/ressources.html"
  // ⚠️ admin-dashboard.html volontairement retiré du cache
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
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH — Stratégies avancées
self.addEventListener("fetch", event => {
  const request = event.request;

  // 1) Ne jamais mettre en cache les requêtes Supabase
  if (request.url.includes("supabase.co")) {
    event.respondWith(fetch(request));
    return;
  }

  // 2) HTML → Network First, mais on NE CACHE PAS l’admin
  if (request.headers.get("accept")?.includes("text/html")) {
    const isAdmin = request.url.includes("admin-dashboard.html");

    event.respondWith(
      fetch(request)
        .then(response => {
          if (!isAdmin) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3) Assets statiques → Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      return (
        cached ||
        fetch(request)
          .then(response => {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
            return response;
          })
          .catch(() => {
            if (request.destination === "image") {
              return caches.match("/assets/logo.svg");
            }
          })
      );
    })
  );
});
