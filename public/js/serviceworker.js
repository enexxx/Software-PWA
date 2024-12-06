const CACHE_NAME = 'kanban-pwa-v1';
const urlsToCache = [       /* TODO check if this is the root url or if its relative, otherwise thsi wont work. ALSO MAYBE DONT NEED SERVER.JS IN HERE BECAUSE THE pwa DEMO PROJECT DOESNT HAVE ITS INDEX.JS IN THERE (NOT SIRS ONE THE ONE HE LINKED) */
    '/',
    '/public/index.html',
    '/public/css/styles.css',
    '/public/js/app.js',
    '/public/images/icon-192x192.png',
    '/public/images/icon-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching important resources');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                });
            })
    );
});