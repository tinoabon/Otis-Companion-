// public/sw.js
// Minimal service worker so Otis can show notifications more reliably
// while the browser is running in the background. This does not yet
// support push notifications when the browser itself is fully closed;
// that would require a backend push service.

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
          self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
                  for (const client of clientList) {
                            if ("focus" in client) {
                                        return client.focus();
                            }
                  }
                  if (self.clients.openWindow) {
                            return self.clients.openWindow("/");
                  }
          })
        );
});
