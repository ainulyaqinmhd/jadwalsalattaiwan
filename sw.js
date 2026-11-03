/**
 * sw.js — Service worker untuk mode offline.
 * - File situs & API jadwal: ambil dari jaringan dulu, pakai cache jika offline.
 * - Library CDN (versi tetap): ambil dari cache dulu.
 * Naikkan CACHE_VERSION jika daftar PRECACHE berubah.
 */
const CACHE_VERSION = 'jadwal-v1';

const PRECACHE = [
    './',
    'index.html',
    'css/style.css',
    'js/translations.js',
    'js/locations.js',
    'js/hijri.js',
    'js/app.js',
    'images/icon.svg',
    'images/kabah_bg.png',
    'https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

const CDN_HOSTS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];
const NETWORK_FIRST_HOSTS = ['api.aladhan.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_VERSION);
        // Satu file gagal tidak boleh menggagalkan instalasi
        await Promise.all(PRECACHE.map(url => cache.add(url).catch(() => {})));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, response.clone());
    }
    return response;
}

async function networkFirst(request, ignoreSearch) {
    try {
        const response = await fetch(request);
        if (response.ok || response.type === 'opaque') {
            const cache = await caches.open(CACHE_VERSION);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        // ignoreSearch untuk file situs (mis. style.css?v=6), bukan untuk URL API
        const cached = await caches.match(request, { ignoreSearch });
        if (cached) return cached;
        throw err;
    }
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);

    if (CDN_HOSTS.includes(url.hostname)) {
        event.respondWith(cacheFirst(request));
    } else if (url.origin === self.location.origin) {
        event.respondWith(networkFirst(request, true));
    } else if (NETWORK_FIRST_HOSTS.includes(url.hostname)) {
        event.respondWith(networkFirst(request, false));
    }
});
