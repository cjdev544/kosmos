import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./auth-context";
import * as authApi from "./api";
import { getAccessToken, getStoredUser } from "../../shared/lib/auth-storage";

vi.mock("./api");

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

const authResult = {
  user: { id: "user-1", email: "user@example.com", name: "Test User", createdAt: "2026-01-01" },
  tokens: { accessToken: "access-token", refreshToken: "refresh-token" },
};

describe("AuthProvider / useAuth", () => {
  it("starts unauthenticated with no stored session", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.authenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("throws when used outside of an AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });

  it("login persists tokens and user, and marks the session authenticated", async () => {
    vi.mocked(authApi.login).mockResolvedValue(authResult);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.login("user@example.com", "secret123"));

    expect(result.current.authenticated).toBe(true);
    expect(result.current.user).toEqual(authResult.user);
    expect(getAccessToken()).toBe("access-token");
    expect(getStoredUser()).toEqual(authResult.user);
  });

  it("register persists tokens and user, and marks the session authenticated", async () => {
    vi.mocked(authApi.register).mockResolvedValue(authResult);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.register("user@example.com", "secret123", "Test User"));

    expect(result.current.authenticated).toBe(true);
    expect(result.current.user).toEqual(authResult.user);
  });

  it("logout clears the stored session", async () => {
    vi.mocked(authApi.login).mockResolvedValue(authResult);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(() => result.current.login("user@example.com", "secret123"));

    act(() => result.current.logout());

    expect(result.current.authenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("restores an already-authenticated session from storage on mount", () => {
    localStorage.setItem("kosmos.accessToken", "existing-access");
    localStorage.setItem("kosmos.refreshToken", "existing-refresh");
    localStorage.setItem("kosmos.user", JSON.stringify(authResult.user));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.authenticated).toBe(true);
    expect(result.current.user).toEqual(authResult.user);
  });
});
