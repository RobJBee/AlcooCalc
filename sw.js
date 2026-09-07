'use strict';

const CACHE_NAME = 'alcoocalc-v2';

const CORE_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/splash.js',
  './js/formulas.js',
  './js/presets.js',
  './js/translations.js',
  './js/katex/katex.min.js',
  './js/katex/katex.min.css',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first pour le shell ; les fichiers non précachés (ex. polices KaTeX
// woff2/ttf, chargées à la demande selon les glyphes utilisés) sont mis en
// cache au premier chargement réussi, garantissant le hors-ligne dès la
// deuxième visite sans devoir lister ici les ~60 fichiers de police.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
