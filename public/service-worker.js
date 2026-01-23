// SW-KILLER: This file forces the unregistration of any stale service worker
self.addEventListener('install', () => {
    // Intecept install to force immediate takeover
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Immediately unregister this SW and reload all clients
    event.waitUntil(
        self.registration.unregister()
            .then(() => self.clients.matchAll())
            .then(clients => {
                clients.forEach(client => client.navigate(client.url));
            })
    );
});
