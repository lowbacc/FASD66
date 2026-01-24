// Nom du cache (change la version pour forcer la mise à jour)
const CACHE_VERSION = "v3-fasd";
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
  "/admin-dashboard.html",
  "/physique-actu.html",
  "/physique-presse.html",
  "/intellectuelle-actu.html",
  "/intellectuelle-presse.html",
  "/projets.html",
  "/ressources.html"
];

// INSTALLATION — Pré-cache des assets statiques
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // active immédiatement la nouvelle version
});

// ACTIVATION — Nettoyage des anciens caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // prend le contrôle immédiatement
});

// FETCH — Stratégies avancées
self.addEventListener("fetch", event => {
  const request = event.request;

  // 1) Ne jamais mettre en cache les requêtes Supabase
  if (request.url.includes("supabase.co")) {
    event.respondWith(fetch(request));
    return;
  }

  // 2) HTML → Network First (toujours essayer d’avoir la version la plus récente)
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
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
            // Fallback si besoin
            if (request.destination === "image") {
              return caches.match("/assets/logo.svg");
            }
          })
      );
    })
  );
});
