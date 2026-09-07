import { describe, expect, it, vi } from "vitest";
import { UpdateSubtaskUseCase } from "./update-subtask.use-case.js";
import { NotFoundError } from "../../../../shared/domain/errors.js";
import type { SubtaskRepository, TaskRepository } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { buildSpace, buildSubtask, buildTask } from "../../../../../test/factories.js";

function buildTaskRepository(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    findById: vi.fn().mockResolvedValue(buildTask({ spaceId: "space-1" })),
    findAllBySpace: vi.fn(),
    findAllByOwner: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
    countBySpaceAndIds: vi.fn(),
    ...overrides,
  };
}

function buildSpaceRepository(overrides: Partial<SpaceRepository> = {}): SpaceRepository {
  return {
    findById: vi.fn().mockResolvedValue(buildSpace({ ownerId: "user-1" })),
    findAllByOwner: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

function buildSubtaskRepository(overrides: Partial<SubtaskRepository> = {}): SubtaskRepository {
  return {
    findById: vi.fn().mockResolvedValue(buildSubtask({ taskId: "task-1" })),
    findAllByTask: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
    ...overrides,
  };
}

describe("UpdateSubtaskUseCase", () => {
  it("updates a subtask belonging to the task", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository();
    const subtaskRepository = buildSubtaskRepository();
    const useCase = new UpdateSubtaskUseCase(taskRepository, spaceRepository, subtaskRepository);

    const result = await useCase.execute({
      requesterId: "user-1",
      spaceId: "space-1",
      taskId: "task-1",
      subtaskId: "subtask-1",
      done: true,
    });

    expect(result.done).toBe(true);
  });

  it("throws NotFoundError when the task belongs to a different space", async () => {
    const taskRepository = buildTaskRepository({
      findById: vi.fn().mockResolvedValue(buildTask({ spaceId: "another-space" })),
    });
    const spaceRepository = buildSpaceRepository();
    const subtaskRepository = buildSubtaskRepository();
    const useCase = new UpdateSubtaskUseCase(taskRepository, spaceRepository, subtaskRepository);

    await expect(
      useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskId: "task-1", subtaskId: "subtask-1" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the subtask does not belong to the task", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository();
    const subtaskRepository = buildSubtaskRepository({
      findById: vi.fn().mockResolvedValue(buildSubtask({ taskId: "another-task" })),
    });
    const useCase = new UpdateSubtaskUseCase(taskRepository, spaceRepository, subtaskRepository);

    await expect(
      useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskId: "task-1", subtaskId: "subtask-1" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the subtask does not exist", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository();
    const subtaskRepository = buildSubtaskRepository({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new UpdateSubtaskUseCase(taskRepository, spaceRepository, subtaskRepository);

    await expect(
      useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskId: "task-1", subtaskId: "missing" }),
    ).rejects.toThrow(NotFoundError);
  });
});
