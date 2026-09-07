import { describe, expect, it, vi } from "vitest";
import { CreateTaskUseCase } from "./create-task.use-case.js";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
import type { TaskRepository } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { buildSpace, buildTask } from "../../../../../test/factories.js";

function buildTaskRepository(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    findById: vi.fn(),
    findAllBySpace: vi.fn().mockResolvedValue([]),
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

describe("CreateTaskUseCase", () => {
  it("creates a task in the owner's space with default status and priority", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository();
    const useCase = new CreateTaskUseCase(taskRepository, spaceRepository);

    const result = await useCase.execute({ requesterId: "user-1", spaceId: "space-1", title: "Comprar leche" });

    expect(result.status).toBe("TODO");
    expect(result.priority).toBe("MEDIUM");
    expect(result.spaceId).toBe("space-1");
  });

  it("positions the new task after the existing ones in the space", async () => {
    const taskRepository = buildTaskRepository({ findAllBySpace: vi.fn().mockResolvedValue([buildTask()]) });
    const spaceRepository = buildSpaceRepository();
    const useCase = new CreateTaskUseCase(taskRepository, spaceRepository);

    const result = await useCase.execute({ requesterId: "user-1", spaceId: "space-1", title: "Otra tarea" });

    expect(result.position).toBe(1);
  });

  it("throws NotFoundError when the space does not exist", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new CreateTaskUseCase(taskRepository, spaceRepository);

    await expect(
      useCase.execute({ requesterId: "user-1", spaceId: "missing", title: "x" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError when the requester does not own the space", async () => {
    const taskRepository = buildTaskRepository();
    const spaceRepository = buildSpaceRepository({
      findById: vi.fn().mockResolvedValue(buildSpace({ ownerId: "owner-1" })),
    });
    const useCase = new CreateTaskUseCase(taskRepository, spaceRepository);

    await expect(
      useCase.execute({ requesterId: "intruder", spaceId: "space-1", title: "x" }),
    ).rejects.toThrow(ForbiddenError);
    expect(taskRepository.save).not.toHaveBeenCalled();
  });
});
