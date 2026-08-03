import { Router } from "express";
import { container } from "tsyringe";
import { asyncHandler } from "../../../../shared/infrastructure/http/async-handler.js";
import { AuthController } from "./auth.controller.js";

export function createAuthRouter(): Router {
  const router = Router();
  const controller = container.resolve(AuthController);

  router.post("/register", asyncHandler(controller.register));
  router.post("/login", asyncHandler(controller.login));
  router.post("/refresh", asyncHandler(controller.refresh));

  return router;
}
