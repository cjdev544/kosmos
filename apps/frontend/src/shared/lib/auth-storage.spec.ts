import { describe, expect, it } from "vitest";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  isAuthenticated,
  setStoredUser,
  setTokens,
} from "./auth-storage";

describe("auth-storage", () => {
  it("returns null tokens when nothing is stored", () => {
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("setTokens stores both tokens and getters read them back", () => {
    setTokens("access-1", "refresh-1");

    expect(getAccessToken()).toBe("access-1");
    expect(getRefreshToken()).toBe("refresh-1");
  });

  it("isAuthenticated reflects whether an access token is stored", () => {
    expect(isAuthenticated()).toBe(false);

    setTokens("access-1", "refresh-1");

    expect(isAuthenticated()).toBe(true);
  });

  it("clearTokens removes both tokens and the stored user", () => {
    setTokens("access-1", "refresh-1");
    setStoredUser({ id: "user-1" });

    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it("setStoredUser/getStoredUser round-trip a JSON-serializable value", () => {
    setStoredUser({ id: "user-1", name: "Test User" });

    expect(getStoredUser()).toEqual({ id: "user-1", name: "Test User" });
  });

  it("getStoredUser returns null when nothing is stored", () => {
    expect(getStoredUser()).toBeNull();
  });

  it("getStoredUser returns null for corrupted JSON instead of throwing", () => {
    localStorage.setItem("kosmos.user", "{not-valid-json");

    expect(getStoredUser()).toBeNull();
  });
});
