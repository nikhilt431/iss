/**
 * PWA Service Worker for Offline Capability
 * Caches core app assets for instant load and offline execution
 */

const CACHE_NAME = 'igniter-bible-quiz-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './css/components.css',
    './js/db.js',
    './js/qrcode.js',
    './js/certificate.js',
    './js/app.js',
    './js/judge.js',
    './js/admin.js'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching critical app assets');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Cleaning old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Network first, fallback to Cache for assets, offline support
self.addEventListener('fetch', (event) => {
    // Only intercept local HTTP/S requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If valid response, cache a clone and return it
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Offline fallback - serve cache
                console.log('Service Worker: Network failed, serving cached resource:', event.request.url);
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Fallback to home shell if index requested
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});


