const CACHE_NAME = "recipe-cms-recipes-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
          });
        }

        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          return cached || Response.error();
        })
      )
  );
});
