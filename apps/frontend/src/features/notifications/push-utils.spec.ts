import { afterEach, describe, expect, it, vi } from "vitest";
import { isIosDevice, isStandalonePwa, urlBase64ToUint8Array } from "./push-utils";

function stubUserAgent(userAgent: string): void {
  vi.stubGlobal("navigator", { ...navigator, userAgent });
}

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("urlBase64ToUint8Array", () => {
  it("decodes a URL-safe base64 VAPID key into bytes", () => {
    // "hello" base64-encoded, using URL-safe characters
    const result = urlBase64ToUint8Array("aGVsbG8");

    expect(Array.from(result)).toEqual([104, 101, 108, 108, 111]);
  });

  it("handles the URL-safe '-' and '_' characters", () => {
    const standard = btoa("a\xfb\xff");
    const urlSafe = standard.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const result = urlBase64ToUint8Array(urlSafe);

    expect(Array.from(result)).toEqual(Array.from(atob(standard)).map((c) => c.charCodeAt(0)));
  });
});

describe("isIosDevice", () => {
  it("returns true for an iPhone user agent", () => {
    stubUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");

    expect(isIosDevice()).toBe(true);
  });

  it("returns false for a non-iOS user agent", () => {
    stubUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    expect(isIosDevice()).toBe(false);
  });
});

describe("isStandalonePwa", () => {
  it("returns true when the display-mode media query matches", () => {
    stubMatchMedia(true);

    expect(isStandalonePwa()).toBe(true);
  });

  it("returns false when neither the media query nor navigator.standalone indicate standalone", () => {
    stubMatchMedia(false);

    expect(isStandalonePwa()).toBe(false);
  });
});
