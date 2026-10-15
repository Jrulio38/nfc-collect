var CACHE = 'nfc-collect-v3';
var ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE && k.indexOf('nfc-collect') === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (r) {
      if (r) return r;
      return fetch(e.request).then(function (resp) {
        if (resp && resp.ok && e.request.url.indexOf(self.location.origin) === 0) {
          var cp = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
        }
        return resp;
      }).catch(function () {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
