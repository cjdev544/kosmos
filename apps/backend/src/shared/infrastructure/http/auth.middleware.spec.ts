import { describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import { requireAuth, type AuthenticatedRequest } from "./auth.middleware.js";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../../domain/errors.js";
import type { Response } from "express";

function buildRequest(headers: Record<string, string> = {}): AuthenticatedRequest {
  return { headers } as AuthenticatedRequest;
}

describe("requireAuth", () => {
  it("attaches the userId and calls next for a valid bearer token", () => {
    const token = jwt.sign({ sub: "user-1" }, env.JWT_ACCESS_SECRET);
    const req = buildRequest({ authorization: `Bearer ${token}` });
    const next = vi.fn();

    requireAuth(req, {} as Response, next);

    expect(req.userId).toBe("user-1");
    expect(next).toHaveBeenCalledWith();
  });

  it("throws UnauthorizedError when the authorization header is missing", () => {
    const req = buildRequest();

    expect(() => requireAuth(req, {} as Response, vi.fn())).toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError when the header does not start with Bearer", () => {
    const req = buildRequest({ authorization: "Basic abc123" });

    expect(() => requireAuth(req, {} as Response, vi.fn())).toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError for an invalid token", () => {
    const req = buildRequest({ authorization: "Bearer not-a-real-token" });

    expect(() => requireAuth(req, {} as Response, vi.fn())).toThrow(UnauthorizedError);
  });

  it("throws UnauthorizedError for a token signed with a different secret", () => {
    const token = jwt.sign({ sub: "user-1" }, "wrong-secret");
    const req = buildRequest({ authorization: `Bearer ${token}` });

    expect(() => requireAuth(req, {} as Response, vi.fn())).toThrow(UnauthorizedError);
  });
});
