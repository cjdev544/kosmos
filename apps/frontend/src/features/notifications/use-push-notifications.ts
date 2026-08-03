import { useEffect, useState } from "react";
import * as notificationsApi from "./api";
import { isIosDevice, isStandalonePwa, urlBase64ToUint8Array } from "./push-utils";

export type PushSupportStatus = "unsupported" | "needs-install" | "ready";

interface UsePushNotificationsResult {
  status: PushSupportStatus;
  subscribed: boolean;
  loading: boolean;
  error: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
}

function getSupportStatus(): PushSupportStatus {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }
  if (isIosDevice() && !isStandalonePwa()) {
    return "needs-install";
  }
  return "ready";
}

export function usePushNotifications(): UsePushNotificationsResult {
  const [status] = useState<PushSupportStatus>(getSupportStatus);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "ready") return;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setSubscribed(subscription !== null))
      .catch(() => undefined);
  }, [status]);

  async function enable(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permiso de notificaciones denegado");
      }

      const registration = await navigator.serviceWorker.ready;
      const { publicKey } = await notificationsApi.getPublicKey();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const json = subscription.toJSON();
      await notificationsApi.subscribe({
        endpoint: subscription.endpoint,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
        timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      });

      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo activar las notificaciones");
    } finally {
      setLoading(false);
    }
  }

  async function disable(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await notificationsApi.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desactivar las notificaciones");
    } finally {
      setLoading(false);
    }
  }

  return { status, subscribed, loading, error, enable, disable };
}
