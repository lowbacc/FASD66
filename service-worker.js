self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("fasd-admin-cache").then(cache => {
      return cache.addAll([
        "admin-dashboard.html",
        "styles.css",
        "main.js",
        "manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
