const CACHE_NAME = 'stash-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    e.respondWith(handleShareTarget(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const shareUrl = formData.get('url') || '';
    const shareText = formData.get('text') || '';
    const shareTitle = formData.get('title') || '';
    const redirectUrl = `/index.html?shareUrl=${encodeURIComponent(shareUrl)}&shareText=${encodeURIComponent(shareText)}&shareTitle=${encodeURIComponent(shareTitle)}`;
    return Response.redirect(redirectUrl, 303);
  } catch (err) {
    return Response.redirect('/index.html', 303);
  }
}
