/* Service worker của vỏ ứng dụng: lưu sẵn màn hình khởi động và icon để app mở nhanh.
   Dữ liệu BHYT không lưu ở đây – luôn lấy trực tiếp từ Google. Đổi số v2, v3… khi sửa index.html. */
var BO_NHO = 'bhyt-cbcs-v2';
var TEP = ['./', 'index.html', 'manifest.webmanifest', 'emblem.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon-48.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(BO_NHO).then(function (c) { return c.addAll(TEP); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== BO_NHO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    /* trang chính: lấy bản mới nhất, mất mạng thì dùng bản đã lưu */
    e.respondWith(fetch(req).then(function (r) {
      var b = r.clone(); caches.open(BO_NHO).then(function (c) { c.put('index.html', b); });
      return r;
    }).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (r) { return r || fetch(req); }));
});
