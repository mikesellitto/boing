/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

interface PushData {
  title?: string;
  body?: string;
  url?: string;
  timestamp?: number;
}

self.addEventListener('push', (event: PushEvent) => {
  const data: PushData = event.data ? event.data.json() : {};
  
  const options: NotificationOptions = {
    body: data.body || 'New notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [500, 200, 500], // Stronger vibration pattern
    requireInteraction: false, // Don't require user interaction
    tag: 'notification-' + Date.now(), // Unique tag to avoid merging
    renotify: true, // Vibrate even when replacing
    timestamp: data.timestamp || Date.now(),
    silent: false, // Ensure notification makes sound
    data: {
      url: data.url || '/',
      timestamp: data.timestamp || Date.now()
    }
  };
  
  // Force immediate display
  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
      .then(() => {
        // Try to wake the device
        if (self.clients && self.clients.claim) {
          return self.clients.claim();
        }
      })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
  );
});