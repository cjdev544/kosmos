import { httpClient } from "../../shared/lib/http-client";

export function getPublicKey(): Promise<{ publicKey: string }> {
  return httpClient.get<{ publicKey: string }>("/notifications/public-key");
}

export function subscribe(input: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  timezoneOffsetMinutes: number;
}): Promise<void> {
  return httpClient.post<void>("/notifications/subscribe", input);
}

export function unsubscribe(endpoint: string): Promise<void> {
  return httpClient.post<void>("/notifications/unsubscribe", { endpoint });
}
