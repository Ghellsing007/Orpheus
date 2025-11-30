const CACHE_VERSION = "v4";
const CACHE_NAME = `orpheus-pwa-${CACHE_VERSION}`;
const IMAGE_CACHE = `orpheus-img-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
  "/apple-icon-180.png",
];

const STATIC_DESTINATIONS = new Set(["style", "script", "font", "image", "worker"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("orpheus-pwa-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Cache dedicado para carátulas/imagenes
  if (request.destination === "image") {
    event.respondWith(cacheImage(request));
    return;
  }

  if (request.destination === "audio" || url.pathname.includes("/stream")) {
    return;
  }

  if (request.mode === "navigate" || (request.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(handlePageRequest(event));
    return;
  }

  if (url.pathname.startsWith("/_next/") || STATIC_DESTINATIONS.has(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function handlePageRequest(event) {
  try {
    const preloadResponse = await event.preloadResponse;
    if (preloadResponse) {
      return preloadResponse;
    }

    const networkResponse = await fetch(event.request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(event.request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cached = await caches.match(event.request);
    if (cached) return cached;

    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function networkFirst(request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(request, { signal: controller.signal });
    if (response && response.ok && isSameOrigin(request.url)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response("Offline", { status: 503, statusText: "Offline" });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok && isSameOrigin(request.url)) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cachedResponse) {
    return cachedResponse;
  }

  const networkResponse = await fetchPromise;
  return networkResponse || caches.match(OFFLINE_URL);
}

function isSameOrigin(url) {
  try {
    return new URL(url).origin === self.location.origin;
  } catch (error) {
    return false;
  }
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Manejo de notificaciones con acciones para controles multimedia
self.addEventListener("notificationclick", (event) => {
  const action = event.action;
  event.notification.close();

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const client = allClients.length ? allClients[0] : await self.clients.openWindow("/");
      if (client && action) {
        client.postMessage({ type: "MEDIA_ACTION", action });
        client.focus && client.focus();
      }
    })(),
  );
});

async function cacheImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok && isSameOrigin(request.url)) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;
  const network = await fetchPromise;
  return network || caches.match(OFFLINE_URL);
}
