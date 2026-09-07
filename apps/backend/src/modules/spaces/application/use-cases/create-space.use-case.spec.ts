import { describe, expect, it, vi } from "vitest";
import { CreateSpaceUseCase } from "./create-space.use-case.js";
import type { SpaceRepository } from "../../domain/ports.js";
import { buildSpace } from "../../../../../test/factories.js";

function buildRepository(overrides: Partial<SpaceRepository> = {}): SpaceRepository {
  return {
    findById: vi.fn(),
    findAllByOwner: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
    ...overrides,
  };
}

describe("CreateSpaceUseCase", () => {
  it("creates a space defaulting viewType to LIST and isActive to true", async () => {
    const repository = buildRepository();
    const useCase = new CreateSpaceUseCase(repository);

    const result = await useCase.execute({ ownerId: "user-1", name: "Trabajo" });

    expect(result.viewType).toBe("LIST");
    expect(result.isActive).toBe(true);
    expect(result.ownerId).toBe("user-1");
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("positions the new space after the existing ones", async () => {
    const repository = buildRepository({
      findAllByOwner: vi.fn().mockResolvedValue([buildSpace(), buildSpace({ id: "space-2" })]),
    });
    const useCase = new CreateSpaceUseCase(repository);

    const result = await useCase.execute({ ownerId: "user-1", name: "Nuevo" });

    expect(result.position).toBe(2);
  });

  it("respects an explicit viewType", async () => {
    const repository = buildRepository();
    const useCase = new CreateSpaceUseCase(repository);

    const result = await useCase.execute({ ownerId: "user-1", name: "Trabajo", viewType: "KANBAN" });

    expect(result.viewType).toBe("KANBAN");
  });
});
