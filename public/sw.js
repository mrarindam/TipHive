const CACHE_NAME = "tiphive-cache-v1";

// Static assets to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/favicon.png",
  "/logo.png",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Install Event: Cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static shell");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force active service worker to take control immediately
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// Fetch Event: Optimized Web3 / Next.js strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. BYPASS Caching for:
  // - Non-GET requests (POST, PUT, DELETE, etc.)
  // - Web3 RPC calls, WalletConnect, Privy authentication, and Supabase database requests
  // - WebSocket handshakes and API endpoints
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api") ||
    url.hostname.includes("privy.io") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("walletconnect") ||
    url.hostname.includes("infura") ||
    url.hostname.includes("alchemy") ||
    url.hostname.includes("mezo") ||
    url.hostname.includes("localhost") && url.port === "3000" && url.pathname.includes("/_next/webpack-hmr")
  ) {
    return; // Let the browser handle standard network fetching
  }

  // 2. NETWORK-FIRST Strategy for HTML Pages (Guarantees up-to-date content)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Store successful page loads in cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, check cache for the page or fallback to home
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match("/");
          });
        })
    );
    return;
  }

  // 3. STALE-WHILE-REVALIDATE Strategy for Static Assets (CSS, JS, Fonts, Images)
  if (
    url.pathname.includes("/_next/static/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });

        // Return cached response instantly if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
  }
});
