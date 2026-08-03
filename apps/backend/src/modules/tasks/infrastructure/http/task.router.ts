import { Router } from "express";
import { container } from "tsyringe";
import { asyncHandler } from "../../../../shared/infrastructure/http/async-handler.js";
import { requireAuth } from "../../../../shared/infrastructure/http/auth.middleware.js";
import { TaskController } from "./task.controller.js";

export function createTaskRouter(): Router {
  const router = Router({ mergeParams: true });
  const controller = container.resolve(TaskController);

  router.use(requireAuth);
  router.post("/", asyncHandler(controller.create));
  router.get("/", asyncHandler(controller.list));
  router.patch("/reorder", asyncHandler(controller.reorderTasks));
  router.patch("/:taskId/status", asyncHandler(controller.updateStatus));
  router.patch("/:taskId", asyncHandler(controller.update));
  router.delete("/:taskId", asyncHandler(controller.deleteTask));
  router.post("/:taskId/subtasks", asyncHandler(controller.createSubtask));
  router.patch("/:taskId/subtasks/:subtaskId", asyncHandler(controller.updateSubtask));
  router.delete("/:taskId/subtasks/:subtaskId", asyncHandler(controller.deleteSubtask));

  return router;
}

export function createMyTasksRouter(): Router {
  const router = Router();
  const controller = container.resolve(TaskController);

  router.use(requireAuth);
  router.get("/", asyncHandler(controller.listMine));

  return router;
}
