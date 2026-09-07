import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePushNotifications } from "./use-push-notifications";
import * as notificationsApi from "./api";
import * as pushUtils from "./push-utils";

vi.mock("./api");
vi.mock("./push-utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./push-utils")>()),
  isIosDevice: vi.fn().mockReturnValue(false),
  isStandalonePwa: vi.fn().mockReturnValue(false),
  urlBase64ToUint8Array: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
}));

function buildSubscription(overrides: { endpoint?: string } = {}) {
  const endpoint = overrides.endpoint ?? "https://push.example.com/endpoint";
  return {
    endpoint,
    toJSON: () => ({ keys: { p256dh: "p256dh-key", auth: "auth-key" } }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  };
}

function stubSupported(options: { existingSubscription?: ReturnType<typeof buildSubscription> | null } = {}) {
  const getSubscription = vi.fn().mockResolvedValue(options.existingSubscription ?? null);
  const subscribe = vi.fn().mockResolvedValue(buildSubscription());
  const registration = { pushManager: { getSubscription, subscribe } };

  vi.stubGlobal("navigator", {
    ...navigator,
    serviceWorker: { ready: Promise.resolve(registration) },
  });
  vi.stubGlobal("PushManager", class {});

  return { getSubscription, subscribe, registration };
}

function stubUnsupported() {
  vi.stubGlobal("navigator", { ...navigator, serviceWorker: undefined });
}

function stubNotification(permission: NotificationPermission, requestResult: NotificationPermission = permission) {
  vi.stubGlobal("Notification", {
    permission,
    requestPermission: vi.fn().mockResolvedValue(requestResult),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePushNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(pushUtils.isIosDevice).mockReturnValue(false);
    vi.mocked(pushUtils.isStandalonePwa).mockReturnValue(false);
  });

  it("reports unsupported when the browser lacks the Push API", () => {
    stubUnsupported();

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.status).toBe("unsupported");
    expect(result.current.subscribed).toBe(false);
  });

  it("reports needs-install on iOS outside of an installed PWA", () => {
    stubSupported();
    vi.mocked(pushUtils.isIosDevice).mockReturnValue(true);
    vi.mocked(pushUtils.isStandalonePwa).mockReturnValue(false);

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.status).toBe("needs-install");
  });

  it("reports ready and reflects an existing subscription", async () => {
    stubSupported({ existingSubscription: buildSubscription() });

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.status).toBe("ready");
    await waitFor(() => expect(result.current.subscribed).toBe(true));
  });

  it("reports not subscribed when there is no existing push subscription", async () => {
    stubSupported({ existingSubscription: null });

    const { result } = renderHook(() => usePushNotifications());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.subscribed).toBe(false);
  });

  describe("enable", () => {
    it("requests permission, subscribes and registers the subscription with the backend", async () => {
      const { subscribe } = stubSupported();
      stubNotification("default", "granted");
      vi.mocked(notificationsApi.getPublicKey).mockResolvedValue({ publicKey: "public-key" });
      vi.mocked(notificationsApi.subscribe).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePushNotifications());
      await waitFor(() => expect(result.current.status).toBe("ready"));

      await act(() => result.current.enable());

      expect(subscribe).toHaveBeenCalledWith({ userVisibleOnly: true, applicationServerKey: expect.anything() });
      expect(notificationsApi.subscribe).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: "https://push.example.com/endpoint",
          keys: { p256dh: "p256dh-key", auth: "auth-key" },
        }),
      );
      expect(result.current.subscribed).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("does not subscribe when the user denies permission", async () => {
      stubSupported();
      stubNotification("default", "denied");

      const { result } = renderHook(() => usePushNotifications());
      await waitFor(() => expect(result.current.status).toBe("ready"));

      await act(() => result.current.enable());

      expect(result.current.subscribed).toBe(false);
      expect(result.current.error).toBe("Permiso de notificaciones denegado");
      expect(notificationsApi.subscribe).not.toHaveBeenCalled();
    });

    it("skips the permission prompt when permission was already granted", async () => {
      stubSupported();
      stubNotification("granted");
      vi.mocked(notificationsApi.getPublicKey).mockResolvedValue({ publicKey: "public-key" });
      vi.mocked(notificationsApi.subscribe).mockResolvedValue(undefined);
      const requestPermission = vi.mocked((globalThis as unknown as { Notification: { requestPermission: () => Promise<NotificationPermission> } }).Notification.requestPermission);

      const { result } = renderHook(() => usePushNotifications());
      await waitFor(() => expect(result.current.status).toBe("ready"));

      await act(() => result.current.enable());

      expect(requestPermission).not.toHaveBeenCalled();
      expect(result.current.subscribed).toBe(true);
    });
  });

  describe("disable", () => {
    it("unsubscribes both the backend and the browser subscription", async () => {
      const existing = buildSubscription();
      stubSupported({ existingSubscription: existing });
      vi.mocked(notificationsApi.unsubscribe).mockResolvedValue(undefined);

      const { result } = renderHook(() => usePushNotifications());
      await waitFor(() => expect(result.current.subscribed).toBe(true));

      await act(() => result.current.disable());

      expect(notificationsApi.unsubscribe).toHaveBeenCalledWith(existing.endpoint);
      expect(existing.unsubscribe).toHaveBeenCalled();
      expect(result.current.subscribed).toBe(false);
    });

    it("does nothing when there is no active subscription", async () => {
      stubSupported({ existingSubscription: null });

      const { result } = renderHook(() => usePushNotifications());
      await waitFor(() => expect(result.current.status).toBe("ready"));

      await act(() => result.current.disable());

      expect(notificationsApi.unsubscribe).not.toHaveBeenCalled();
      expect(result.current.subscribed).toBe(false);
    });
  });
});
