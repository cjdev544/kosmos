import { describe, expect, it, vi } from "vitest";
import { DeleteTaskUseCase } from "./delete-task.use-case.js";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
import type { TaskRepository } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { buildSpace, buildTask } from "../../../../../test/factories.js";

function buildTaskRepository(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    findById: vi.fn().mockResolvedValue(buildTask({ spaceId: "space-1" })),
    findAllBySpace: vi.fn(),
    findAllByOwner: vi.fn(),
    save: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
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

describe("DeleteTaskUseCase", () => {
  it("deletes a task in the owner's space", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository();
    const useCase = new DeleteTaskUseCase(taskRepository, spaceRepository);

    await useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskId: "task-1" });

    expect(taskRepository.delete).toHaveBeenCalledWith("task-1");
  });

  it("throws NotFoundError when the task belongs to a different space", async () => {
    const taskRepository = buildTaskRepository({
      findById: vi.fn().mockResolvedValue(buildTask({ spaceId: "another-space" })),
    });
    const spaceRepository = buildSpaceRepository();
    const useCase = new DeleteTaskUseCase(taskRepository, spaceRepository);

    await expect(
      useCase.execute({ requesterId: "user-1", spaceId: "space-1", taskId: "task-1" }),
    ).rejects.toThrow(NotFoundError);
    expect(taskRepository.delete).not.toHaveBeenCalled();
  });

  it("throws ForbiddenError when the requester does not own the space", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository({
      findById: vi.fn().mockResolvedValue(buildSpace({ ownerId: "owner-1" })),
    });
    const useCase = new DeleteTaskUseCase(taskRepository, spaceRepository);

    await expect(
      useCase.execute({ requesterId: "intruder", spaceId: "space-1", taskId: "task-1" }),
    ).rejects.toThrow(ForbiddenError);
    expect(taskRepository.delete).not.toHaveBeenCalled();
  });
});
