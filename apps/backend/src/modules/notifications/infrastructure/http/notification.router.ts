import { Router } from "express";
import { container } from "tsyringe";
import { asyncHandler } from "../../../../shared/infrastructure/http/async-handler.js";
import { requireAuth } from "../../../../shared/infrastructure/http/auth.middleware.js";
import { NotificationController } from "./notification.controller.js";

export function createNotificationRouter(): Router {
  const router = Router();
  const controller = container.resolve(NotificationController);

  router.use(requireAuth);
  router.get("/public-key", asyncHandler(controller.publicKey));
  router.post("/subscribe", asyncHandler(controller.subscribe));
  router.post("/unsubscribe", asyncHandler(controller.unsubscribe));

  return router;
}
