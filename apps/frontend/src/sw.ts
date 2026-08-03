/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();

self.addEventListener("push", (event) => {
  let payload = { title: "Kosmos", body: "" };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    payload.body = event.data?.text() ?? "";
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsList) => {
      for (const client of clientsList) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow("/");
    }),
  );
});
