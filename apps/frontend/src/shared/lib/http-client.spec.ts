import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth-storage", () => ({
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

import { httpClient, HttpError } from "./http-client";
import * as authStorage from "./auth-storage";

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("httpClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let originalLocation: Location;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(authStorage.getAccessToken).mockReturnValue(null);
    vi.mocked(authStorage.getRefreshToken).mockReturnValue(null);
    originalLocation = window.location;
    Object.defineProperty(window, "location", { configurable: true, value: { href: "" } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
  });

  it("attaches the Authorization header when an access token is stored", async () => {
    vi.mocked(authStorage.getAccessToken).mockReturnValue("access-token");
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    await httpClient.get("/spaces");

    const [, options] = fetchMock.mock.calls[0];
    expect((options.headers as Headers).get("Authorization")).toBe("Bearer access-token");
  });

  it("omits the Authorization header when there is no access token", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));

    await httpClient.get("/spaces");

    const [, options] = fetchMock.mock.calls[0];
    expect((options.headers as Headers).has("Authorization")).toBe(false);
  });

  it("returns the parsed JSON body for a successful response", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: "space-1" }));

    const result = await httpClient.get<{ id: string }>("/spaces/space-1");

    expect(result).toEqual({ id: "space-1" });
  });

  it("returns undefined for a 204 No Content response", async () => {
    fetchMock.mockResolvedValue(jsonResponse(204, null));

    const result = await httpClient.delete("/spaces/space-1");

    expect(result).toBeUndefined();
  });

  it("throws HttpError with the server-provided message for a failed request", async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { error: { message: "Datos inválidos" } }));

    await expect(httpClient.post("/spaces", {})).rejects.toMatchObject(
      new HttpError(400, "Datos inválidos"),
    );
  });

  it("falls back to a default message when the error body is not parseable", async () => {
    const response = {
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    } as unknown as Response;
    fetchMock.mockResolvedValue(response);

    await expect(httpClient.get("/spaces")).rejects.toMatchObject(new HttpError(500, "La solicitud falló"));
  });

  it("does not attempt to refresh on a 401 from a public auth path", async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { error: { message: "Credenciales inválidas" } }));

    await expect(httpClient.post("/auth/login", {})).rejects.toMatchObject(
      new HttpError(401, "Credenciales inválidas"),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes the access token and retries once on a 401 from a protected path", async () => {
    vi.mocked(authStorage.getRefreshToken).mockReturnValue("refresh-token");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { error: { message: "Token inválido" } }))
      .mockResolvedValueOnce(jsonResponse(200, { tokens: { accessToken: "new-access", refreshToken: "new-refresh" } }))
      .mockResolvedValueOnce(jsonResponse(200, { id: "space-1" }));

    const result = await httpClient.get<{ id: string }>("/spaces/space-1");

    expect(result).toEqual({ id: "space-1" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain("/auth/refresh");
    expect(authStorage.setTokens).toHaveBeenCalledWith("new-access", "new-refresh");
  });

  it("clears tokens and redirects to /login when there is no refresh token to use", async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { error: { message: "Token inválido" } }));

    await expect(httpClient.get("/spaces")).rejects.toMatchObject(new HttpError(401, "Sesión expirada"));
    expect(authStorage.clearTokens).toHaveBeenCalled();
    expect(window.location.href).toBe("/login");
  });

  it("clears tokens and redirects to /login when the refresh request itself fails", async () => {
    vi.mocked(authStorage.getRefreshToken).mockReturnValue("refresh-token");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { error: { message: "Token inválido" } }))
      .mockResolvedValueOnce(jsonResponse(401, { error: { message: "Refresh inválido" } }));

    await expect(httpClient.get("/spaces")).rejects.toMatchObject(new HttpError(401, "Sesión expirada"));
    expect(authStorage.clearTokens).toHaveBeenCalled();
    expect(window.location.href).toBe("/login");
  });

  it("deduplicates concurrent refresh attempts into a single request", async () => {
    vi.mocked(authStorage.getRefreshToken).mockReturnValue("refresh-token");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { error: {} }))
      .mockResolvedValueOnce(jsonResponse(401, { error: {} }))
      .mockResolvedValueOnce(jsonResponse(200, { tokens: { accessToken: "new-access", refreshToken: "new-refresh" } }))
      .mockResolvedValueOnce(jsonResponse(200, { id: "a" }))
      .mockResolvedValueOnce(jsonResponse(200, { id: "b" }));

    const [a, b] = await Promise.all([httpClient.get("/spaces/a"), httpClient.get("/spaces/b")]);

    expect(a).toEqual({ id: "a" });
    expect(b).toEqual({ id: "b" });
    const refreshCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes("/auth/refresh"));
    expect(refreshCalls).toHaveLength(1);
  });
});
