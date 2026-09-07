import { describe, expect, it, vi } from "vitest";
import { ListMyTasksUseCase } from "./list-my-tasks.use-case.js";
import type { TaskRepository } from "../../domain/ports.js";
import { buildTask } from "../../../../../test/factories.js";

function buildTaskRepository(overrides: Partial<TaskRepository> = {}): TaskRepository {
  return {
    findById: vi.fn(),
    findAllBySpace: vi.fn(),
    findAllByOwner: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
    countBySpaceAndIds: vi.fn(),
    ...overrides,
  };
}

describe("ListMyTasksUseCase", () => {
  it("returns all tasks across the owner's spaces", async () => {
    const taskRepository = buildTaskRepository({
      findAllByOwner: vi.fn().mockResolvedValue([buildTask({ id: "task-1" }), buildTask({ id: "task-2" })]),
    });
    const useCase = new ListMyTasksUseCase(taskRepository);

    const result = await useCase.execute("user-1");

    expect(result.map((t) => t.id)).toEqual(["task-1", "task-2"]);
    expect(taskRepository.findAllByOwner).toHaveBeenCalledWith("user-1");
  });

  it("returns an empty array when the owner has no tasks", async () => {
    const taskRepository = buildTaskRepository();
    const useCase = new ListMyTasksUseCase(taskRepository);

    expect(await useCase.execute("user-1")).toEqual([]);
  });
});
