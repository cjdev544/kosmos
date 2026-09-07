import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { AuthController } from "./auth.controller.js";
import type { LoginUserUseCase, RefreshTokenUseCase, RegisterUserUseCase } from "../../domain/ports.js";
import type { Request, Response } from "express";

function buildResponse(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const authResult = {
  user: { id: "user-1", email: "user@example.com", name: "Test User", createdAt: new Date("2026-01-01") },
  tokens: { accessToken: "access", refreshToken: "refresh" },
};

describe("AuthController", () => {
  describe("register", () => {
    it("parses the body, calls the use case and responds 201", async () => {
      const registerUseCase: RegisterUserUseCase = { execute: vi.fn().mockResolvedValue(authResult) };
      const controller = new AuthController(registerUseCase, {} as LoginUserUseCase, {} as RefreshTokenUseCase);
      const req = { body: { email: "user@example.com", password: "secret123", name: "Test User" } } as Request;
      const res = buildResponse();

      await controller.register(req, res);

      expect(registerUseCase.execute).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
        name: "Test User",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(authResult);
    });

    it("throws a ZodError when the body is invalid and does not call the use case", async () => {
      const registerUseCase: RegisterUserUseCase = { execute: vi.fn() };
      const controller = new AuthController(registerUseCase, {} as LoginUserUseCase, {} as RefreshTokenUseCase);
      const req = { body: { email: "not-an-email", password: "short", name: "" } } as Request;
      const res = buildResponse();

      await expect(controller.register(req, res)).rejects.toThrow(ZodError);
      expect(registerUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("parses the body, calls the use case and responds 200", async () => {
      const loginUseCase: LoginUserUseCase = { execute: vi.fn().mockResolvedValue(authResult) };
      const controller = new AuthController({} as RegisterUserUseCase, loginUseCase, {} as RefreshTokenUseCase);
      const req = { body: { email: "user@example.com", password: "secret123" } } as Request;
      const res = buildResponse();

      await controller.login(req, res);

      expect(loginUseCase.execute).toHaveBeenCalledWith({ email: "user@example.com", password: "secret123" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(authResult);
    });
  });

  describe("refresh", () => {
    it("parses the body, calls the use case and responds 200", async () => {
      const refreshUseCase: RefreshTokenUseCase = { execute: vi.fn().mockResolvedValue(authResult) };
      const controller = new AuthController({} as RegisterUserUseCase, {} as LoginUserUseCase, refreshUseCase);
      const req = { body: { refreshToken: "a-refresh-token" } } as Request;
      const res = buildResponse();

      await controller.refresh(req, res);

      expect(refreshUseCase.execute).toHaveBeenCalledWith({ refreshToken: "a-refresh-token" });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("throws a ZodError when refreshToken is missing", async () => {
      const refreshUseCase: RefreshTokenUseCase = { execute: vi.fn() };
      const controller = new AuthController({} as RegisterUserUseCase, {} as LoginUserUseCase, refreshUseCase);
      const req = { body: {} } as Request;
      const res = buildResponse();

      await expect(controller.refresh(req, res)).rejects.toThrow(ZodError);
    });
  });
});
