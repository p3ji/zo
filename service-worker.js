const CACHE = "piano-pals-v6";
const ASSETS = ["./", "./index.html", "./style.css", "./app.js", "./coloring-data.js", "./coloring-large-data.js", "./coloring-kawaii-data.js", "./surface-art.js", "./play.js", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./art/dolphin-dream.png", "./art/rainbow-castle.png", "./art/moonlight-garden.png", "./art/space-kitty.png", "./art/ocean-orchestra.png", "./art/magic-library.png", "./art/starry-treehouse.png", "./art/bunny-tea-party.png", "./art/sleepy-moon-cat.png", "./art/panda-bakery.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || caches.match("./index.html"))));
});
