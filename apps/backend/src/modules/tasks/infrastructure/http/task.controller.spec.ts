import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { TaskController } from "./task.controller.js";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import type {
  CreateSubtaskUseCase,
  CreateTaskUseCase,
  DeleteSubtaskUseCase,
  DeleteTaskUseCase,
  ListMyTasksUseCase,
  ListTasksUseCase,
  ReorderTasksUseCase,
  UpdateSubtaskUseCase,
  UpdateTaskStatusUseCase,
  UpdateTaskUseCase,
} from "../../domain/ports.js";
import type { AuthenticatedRequest } from "../../../../shared/infrastructure/http/auth.middleware.js";
import type { Response } from "express";

function buildResponse(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

function buildController(overrides: {
  createTaskUseCase?: Partial<CreateTaskUseCase>;
  listTasksUseCase?: Partial<ListTasksUseCase>;
  updateTaskStatusUseCase?: Partial<UpdateTaskStatusUseCase>;
  listMyTasksUseCase?: Partial<ListMyTasksUseCase>;
  updateTaskUseCase?: Partial<UpdateTaskUseCase>;
  createSubtaskUseCase?: Partial<CreateSubtaskUseCase>;
  updateSubtaskUseCase?: Partial<UpdateSubtaskUseCase>;
  deleteSubtaskUseCase?: Partial<DeleteSubtaskUseCase>;
  deleteTaskUseCase?: Partial<DeleteTaskUseCase>;
  reorderTasksUseCase?: Partial<ReorderTasksUseCase>;
} = {}): TaskController {
  return new TaskController(
    { execute: vi.fn(), ...overrides.createTaskUseCase } as CreateTaskUseCase,
    { execute: vi.fn(), ...overrides.listTasksUseCase } as ListTasksUseCase,
    { execute: vi.fn(), ...overrides.updateTaskStatusUseCase } as UpdateTaskStatusUseCase,
    { execute: vi.fn(), ...overrides.listMyTasksUseCase } as ListMyTasksUseCase,
    { execute: vi.fn(), ...overrides.updateTaskUseCase } as UpdateTaskUseCase,
    { execute: vi.fn(), ...overrides.createSubtaskUseCase } as CreateSubtaskUseCase,
    { execute: vi.fn(), ...overrides.updateSubtaskUseCase } as UpdateSubtaskUseCase,
    { execute: vi.fn(), ...overrides.deleteSubtaskUseCase } as DeleteSubtaskUseCase,
    { execute: vi.fn(), ...overrides.deleteTaskUseCase } as DeleteTaskUseCase,
    { execute: vi.fn(), ...overrides.reorderTasksUseCase } as ReorderTasksUseCase,
  );
}

describe("TaskController", () => {
  describe("create", () => {
    it("creates a task in the given space", async () => {
      const createTaskUseCase = { execute: vi.fn().mockResolvedValue({ id: "task-1" }) };
      const controller = buildController({ createTaskUseCase });
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1" },
        body: { title: "Comprar leche" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.create(req, res);

      expect(createTaskUseCase.execute).toHaveBeenCalledWith({
        requesterId: "user-1",
        spaceId: "space-1",
        title: "Comprar leche",
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("throws UnauthorizedError when there is no authenticated user", async () => {
      const controller = buildController();
      const req = { params: { spaceId: "space-1" }, body: { title: "x" } } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.create(req, res)).rejects.toThrow(UnauthorizedError);
    });

    it("throws a ZodError for an invalid body", async () => {
      const controller = buildController();
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1" },
        body: { title: "" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.create(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe("list", () => {
    it("lists tasks in the given space", async () => {
      const listTasksUseCase = { execute: vi.fn().mockResolvedValue([]) };
      const controller = buildController({ listTasksUseCase });
      const req = { userId: "user-1", params: { spaceId: "space-1" } } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.list(req, res);

      expect(listTasksUseCase.execute).toHaveBeenCalledWith({ requesterId: "user-1", spaceId: "space-1" });
    });
  });

  describe("updateStatus", () => {
    it("updates the task status", async () => {
      const updateTaskStatusUseCase = { execute: vi.fn().mockResolvedValue({ id: "task-1", status: "DONE" }) };
      const controller = buildController({ updateTaskStatusUseCase });
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1", taskId: "task-1" },
        body: { status: "DONE" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.updateStatus(req, res);

      expect(updateTaskStatusUseCase.execute).toHaveBeenCalledWith({
        requesterId: "user-1",
        spaceId: "space-1",
        taskId: "task-1",
        status: "DONE",
      });
    });

    it("throws a ZodError for an invalid status", async () => {
      const controller = buildController();
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1", taskId: "task-1" },
        body: { status: "ARCHIVED" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.updateStatus(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe("listMine", () => {
    it("lists tasks across all of the requester's spaces", async () => {
      const listMyTasksUseCase = { execute: vi.fn().mockResolvedValue([]) };
      const controller = buildController({ listMyTasksUseCase });
      const req = { userId: "user-1" } as AuthenticatedRequest;
      const res = buildResponse();

      await controller.listMine(req, res);

      expect(listMyTasksUseCase.execute).toHaveBeenCalledWith("user-1");
    });
  });

  describe("update", () => {
    it("updates the task", async () => {
      const updateTaskUseCase = { execute: vi.fn().mockResolvedValue({ id: "task-1" }) };
      const controller = buildController({ updateTaskUseCase });
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1", taskId: "task-1" },
        body: { title: "Nuevo título" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.update(req, res);

      expect(updateTaskUseCase.execute).toHaveBeenCalledWith({
        requesterId: "user-1",
        spaceId: "space-1",
        taskId: "task-1",
        title: "Nuevo título",
      });
    });
  });

  describe("createSubtask", () => {
    it("creates a subtask under the given task", async () => {
      const createSubtaskUseCase = { execute: vi.fn().mockResolvedValue({ id: "subtask-1" }) };
      const controller = buildController({ createSubtaskUseCase });
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1", taskId: "task-1" },
        body: { title: "Comprar huevos" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.createSubtask(req, res);

      expect(createSubtaskUseCase.execute).toHaveBeenCalledWith({
        requesterId: "user-1",
        spaceId: "space-1",
        taskId: "task-1",
        title: "Comprar huevos",
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("updateSubtask", () => {
    it("updates a subtask", async () => {
      const updateSubtaskUseCase = { execute: vi.fn().mockResolvedValue({ id: "subtask-1", done: true }) };
      const controller = buildController({ updateSubtaskUseCase });
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1", taskId: "task-1", subtaskId: "subtask-1" },
        body: { done: true },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.updateSubtask(req, res);

      expect(updateSubtaskUseCase.execute).toHaveBeenCalledWith({
        requesterId: "user-1",
        spaceId: "space-1",
        taskId: "task-1",
        subtaskId: "subtask-1",
        done: true,
      });
    });
  });

  describe("deleteSubtask", () => {
    it("deletes a subtask and responds 204", async () => {
      const deleteSubtaskUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
      const controller = buildController({ deleteSubtaskUseCase });
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1", taskId: "task-1", subtaskId: "subtask-1" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.deleteSubtask(req, res);

      expect(deleteSubtaskUseCase.execute).toHaveBeenCalledWith({
        requesterId: "user-1",
        spaceId: "space-1",
        taskId: "task-1",
        subtaskId: "subtask-1",
      });
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  describe("reorderTasks", () => {
    it("reorders tasks and responds 204", async () => {
      const reorderTasksUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
      const controller = buildController({ reorderTasksUseCase });
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1" },
        body: { taskIds: ["11111111-1111-1111-1111-111111111111"] },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.reorderTasks(req, res);

      expect(reorderTasksUseCase.execute).toHaveBeenCalledWith({
        requesterId: "user-1",
        spaceId: "space-1",
        taskIds: ["11111111-1111-1111-1111-111111111111"],
      });
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it("throws a ZodError when a taskId is not a uuid", async () => {
      const controller = buildController();
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1" },
        body: { taskIds: ["not-a-uuid"] },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await expect(controller.reorderTasks(req, res)).rejects.toThrow(ZodError);
    });
  });

  describe("deleteTask", () => {
    it("deletes the task and responds 204", async () => {
      const deleteTaskUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
      const controller = buildController({ deleteTaskUseCase });
      const req = {
        userId: "user-1",
        params: { spaceId: "space-1", taskId: "task-1" },
      } as unknown as AuthenticatedRequest;
      const res = buildResponse();

      await controller.deleteTask(req, res);

      expect(deleteTaskUseCase.execute).toHaveBeenCalledWith({
        requesterId: "user-1",
        spaceId: "space-1",
        taskId: "task-1",
      });
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
