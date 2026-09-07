import { describe, expect, it, vi } from "vitest";
import { UpdateTaskUseCase } from "./update-task.use-case.js";
import { NotFoundError } from "../../../../shared/domain/errors.js";
import type { TaskRepository } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { buildSpace, buildTask } from "../../../../../test/factories.js";

function buildTaskRepository(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    findById: vi.fn().mockResolvedValue(buildTask({ spaceId: "space-1" })),
    findAllBySpace: vi.fn(),
    findAllByOwner: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
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

describe("UpdateTaskUseCase", () => {
  it("updates the provided fields of a task in the owner's space", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository();
    const useCase = new UpdateTaskUseCase(taskRepository, spaceRepository);

    const result = await useCase.execute({
      requesterId: "user-1",
      spaceId: "space-1",
      taskId: "task-1",
      title: "Nuevo título",
      priority: "HIGH",
    });

    expect(result.title).toBe("Nuevo título");
    expect(result.priority).toBe("HIGH");
  });

  it("throws NotFoundError when the task does not exist", async () => {
    const taskRepository = buildTaskRepository({ findById: vi.fn().mockResolvedValue(null) });
    const spaceRepository = buildSpaceRepository();
    const useCase = new UpdateTaskUseCase(taskRepository, spaceRepository);

    await expect(
      useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskId: "missing" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the task belongs to a different space", async () => {
    const taskRepository = buildTaskRepository({
      findById: vi.fn().mockResolvedValue(buildTask({ spaceId: "another-space" })),
    });
    const spaceRepository = buildSpaceRepository();
    const useCase = new UpdateTaskUseCase(taskRepository, spaceRepository);

    await expect(
      useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskId: "task-1", title: "x" }),
    ).rejects.toThrow(NotFoundError);
  });
});
