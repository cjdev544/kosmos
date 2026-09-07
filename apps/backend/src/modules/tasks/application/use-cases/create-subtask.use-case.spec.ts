import { describe, expect, it, vi } from "vitest";
import { CreateSubtaskUseCase } from "./create-subtask.use-case.js";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
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
    findById: vi.fn(),
    findAllByTask: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
    ...overrides,
  };
}

describe("CreateSubtaskUseCase", () => {
  it("creates a subtask for a task in the owner's space", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository();
    const subtaskRepository = buildSubtaskRepository();
    const useCase = new CreateSubtaskUseCase(taskRepository, spaceRepository, subtaskRepository);

    const result = await useCase.execute({
      requesterId: "user-1",
      spaceId: "space-1",
      taskId: "task-1",
      title: "Comprar huevos",
    });

    expect(result.title).toBe("Comprar huevos");
    expect(result.done).toBe(false);
    expect(result.position).toBe(0);
  });

  it("positions the new subtask after the existing ones", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository();
    const subtaskRepository = buildSubtaskRepository({ findAllByTask: vi.fn().mockResolvedValue([buildSubtask()]) });
    const useCase = new CreateSubtaskUseCase(taskRepository, spaceRepository, subtaskRepository);

    const result = await useCase.execute({
      requesterId: "user-1",
      spaceId: "space-1",
      taskId: "task-1",
      title: "Otra subtarea",
    });

    expect(result.position).toBe(1);
  });

  it("throws NotFoundError when the task belongs to a different space", async () => {
    const taskRepository = buildTaskRepository({
      findById: vi.fn().mockResolvedValue(buildTask({ spaceId: "another-space" })),
    });
    const spaceRepository = buildSpaceRepository();
    const subtaskRepository = buildSubtaskRepository();
    const useCase = new CreateSubtaskUseCase(taskRepository, spaceRepository, subtaskRepository);

    await expect(
      useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskId: "task-1", title: "x" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError when the requester does not own the space", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository({
      findById: vi.fn().mockResolvedValue(buildSpace({ ownerId: "owner-1" })),
    });
    const subtaskRepository = buildSubtaskRepository();
    const useCase = new CreateSubtaskUseCase(taskRepository, spaceRepository, subtaskRepository);

    await expect(
      useCase.execute({ requesterId: "intruder", spaceId: "space-1", taskId: "task-1", title: "x" }),
    ).rejects.toThrow(ForbiddenError);
  });
});
