import { describe, expect, it, vi } from "vitest";
import { ListTasksUseCase } from "./list-tasks.use-case.js";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
import type { TaskRepository } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { buildSpace, buildTask } from "../../../../../test/factories.js";

function buildTaskRepository(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    findById: vi.fn(),
    findAllBySpace: vi.fn().mockResolvedValue([]),
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

describe("ListTasksUseCase", () => {
  it("returns the tasks of the owner's space", async () => {
    const taskRepository = buildTaskRepository({
      findAllBySpace: vi.fn().mockResolvedValue([buildTask({ id: "task-1" }), buildTask({ id: "task-2" })]),
    });
    const spaceRepository = buildSpaceRepository();
    const useCase = new ListTasksUseCase(taskRepository, spaceRepository);

    const result = await useCase.execute({ requesterId: "user-1", spaceId: "space-1" });

    expect(result.map((t) => t.id)).toEqual(["task-1", "task-2"]);
  });

  it("throws NotFoundError when the space does not exist", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new ListTasksUseCase(taskRepository, spaceRepository);

    await expect(useCase.execute({ requesterId: "user-1", spaceId: "missing" })).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError when the requester does not own the space", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository({
      findById: vi.fn().mockResolvedValue(buildSpace({ ownerId: "owner-1" })),
    });
    const useCase = new ListTasksUseCase(taskRepository, spaceRepository);

    await expect(useCase.execute({ requesterId: "intruder", spaceId: "space-1" })).rejects.toThrow(
      ForbiddenError,
    );
  });
});
