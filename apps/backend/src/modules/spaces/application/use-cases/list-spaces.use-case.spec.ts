import { describe, expect, it, vi } from "vitest";
import { ListSpacesUseCase } from "./list-spaces.use-case.js";
import type { SpaceRepository } from "../../domain/ports.js";
import { buildSpace } from "../../../../../test/factories.js";

function buildRepository(overrides: Partial<SpaceRepository> = {}): SpaceRepository {
  return {
    findById: vi.fn(),
    findAllByOwner: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

describe("ListSpacesUseCase", () => {
  it("returns the owner's spaces as plain snapshots", async () => {
    const repository = buildRepository({
      findAllByOwner: vi.fn().mockResolvedValue([buildSpace({ id: "space-1" }), buildSpace({ id: "space-2" })]),
    });
    const useCase = new ListSpacesUseCase(repository);

    const result = await useCase.execute("user-1");

    expect(result).toHaveLength(2);
    expect(result.map((s) => s.id)).toEqual(["space-1", "space-2"]);
  });

  it("returns an empty array when the owner has no spaces", async () => {
    const repository = buildRepository();
    const useCase = new ListSpacesUseCase(repository);

    const result = await useCase.execute("user-1");

    expect(result).toEqual([]);
  });

  it("queries the repository scoped to the given owner", async () => {
    const repository = buildRepository();
    const useCase = new ListSpacesUseCase(repository);

    await useCase.execute("owner-42");

    expect(repository.findAllByOwner).toHaveBeenCalledWith("owner-42");
  });
});
