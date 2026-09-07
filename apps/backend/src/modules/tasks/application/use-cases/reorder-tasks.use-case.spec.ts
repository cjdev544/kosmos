import { describe, expect, it, vi } from "vitest";
import { ReorderTasksUseCase } from "./reorder-tasks.use-case.js";
import { ForbiddenError, ValidationError } from "../../../../shared/domain/errors.js";
import type { TaskRepository } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { buildSpace } from "../../../../../test/factories.js";

function buildTaskRepository(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    findById: vi.fn(),
    findAllBySpace: vi.fn(),
    findAllByOwner: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn().mockResolvedValue(undefined),
    countBySpaceAndIds: vi.fn().mockResolvedValue(2),
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

describe("ReorderTasksUseCase", () => {
  it("reorders tasks that all belong to the space", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository();
    const useCase = new ReorderTasksUseCase(taskRepository, spaceRepository);

    await useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskIds: ["task-1", "task-2"] });

    expect(taskRepository.reorder).toHaveBeenCalledWith(["task-1", "task-2"]);
  });

  it("throws ValidationError when some task ids don't belong to the space", async () => {
    const taskRepository = buildTaskRepository({ countBySpaceAndIds: vi.fn().mockResolvedValue(1) });
    const spaceRepository = buildSpaceRepository();
    const useCase = new ReorderTasksUseCase(taskRepository, spaceRepository);

    await expect(
      useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskIds: ["task-1", "foreign-task"] }),
    ).rejects.toThrow(ValidationError);
    expect(taskRepository.reorder).not.toHaveBeenCalled();
  });

  it("throws ForbiddenError when the requester does not own the space", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository({
      findById: vi.fn().mockResolvedValue(buildSpace({ ownerId: "owner-1" })),
    });
    const useCase = new ReorderTasksUseCase(taskRepository, spaceRepository);

    await expect(
      useCase.execute({ requesterId: "intruder", spaceId: "space-1", taskIds: ["task-1"] }),
    ).rejects.toThrow(ForbiddenError);
  });
});
