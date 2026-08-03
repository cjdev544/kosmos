import { Router } from "express";
import { container } from "tsyringe";
import { asyncHandler } from "../../../../shared/infrastructure/http/async-handler.js";
import { requireAuth } from "../../../../shared/infrastructure/http/auth.middleware.js";
import { SpaceController } from "./space.controller.js";

export function createSpaceRouter(): Router {
  const router = Router();
  const controller = container.resolve(SpaceController);

  router.use(requireAuth);
  router.post("/", asyncHandler(controller.create));
  router.get("/", asyncHandler(controller.list));
  router.patch("/:id/toggle", asyncHandler(controller.toggle));
  router.patch("/:id/view", asyncHandler(controller.changeView));
  router.patch("/:id/color", asyncHandler(controller.changeColor));
  router.delete("/:id", asyncHandler(controller.delete));
  router.get("/templates", asyncHandler(controller.listTemplates));
  router.post("/templates/:templateId/apply", asyncHandler(controller.applyTemplate));

  return router;
}
