import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { NotificationController } from "./notification.controller.js";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import { env } from "../../../../shared/infrastructure/config/env.js";
import type { SubscribeUseCase, UnsubscribeUseCase } from "../../domain/ports.js";
import type { AuthenticatedRequest } from "../../../../shared/infrastructure/http/auth.middleware.js";
import type { Response } from "express";

function buildResponse(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

describe("NotificationController", () => {
  describe("publicKey", () => {
    it("returns the configured VAPID public key without requiring authentication", async () => {
      const controller = new NotificationController({} as SubscribeUseCase, {} as UnsubscribeUseCase);
      const req = {} as AuthenticatedRequest;
      const res = buildResponse();

      await controller.publicKey(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ publicKey: env.VAPID_PUBLIC_KEY });
    });
  });

  describe("subscribe", () => {
    it("subscribes the authenticated user", async () => {
      const subscribeUseCase = { execute: vi.fn().mockResolvedValue({ id: "subscription-1" }) };
      const controller = new NotificationController(
        subscribeUseCase as SubscribeUseCase,
        {} as UnsubscribeUseCase,
      );
      const req = {
        userId: "user-1",
        body: {
          endpoint: "https://push.example.com/endpoint",
          keys: { p256dh: "p256dh", auth: "auth" },
          timezoneOffsetMinutes: 60,
        },
      } as AuthenticatedRequest;
      const res = buildResponse();

      await controller.subscribe(req, res);

      expect(subscribeUseCase.execute).toHaveBeenCalledWith({
        userId: "user-1",
        endpoint: "https://push.example.com/endpoint",
        p256dh: "p256dh",
        auth: "auth",
        timezoneOffsetMinutes: 60,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("throws UnauthorizedError when there is no authenticated user", async () => {
      const controller = new NotificationController({} as SubscribeUseCase, {} as UnsubscribeUseCase);
      const req = {
        body: { endpoint: "e", keys: { p256dh: "p", auth: "a" }, timezoneOffsetMinutes: 0 },
      } as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.subscribe(req, res)).rejects.toThrow(UnauthorizedError);
    });

    it("throws a ZodError for an invalid body", async () => {
      const controller = new NotificationController({} as SubscribeUseCase, {} as UnsubscribeUseCase);
      const req = { userId: "user-1", body: { endpoint: "" } } as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.subscribe(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe("unsubscribe", () => {
    it("unsubscribes the authenticated user and responds 204", async () => {
      const unsubscribeUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
      const controller = new NotificationController(
        {} as SubscribeUseCase,
        unsubscribeUseCase as UnsubscribeUseCase,
      );
      const req = {
        userId: "user-1",
        body: { endpoint: "https://push.example.com/endpoint" },
      } as AuthenticatedRequest;
      const res = buildResponse();

      await controller.unsubscribe(req, res);

      expect(unsubscribeUseCase.execute).toHaveBeenCalledWith({
        userId: "user-1",
        endpoint: "https://push.example.com/endpoint",
      });
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
