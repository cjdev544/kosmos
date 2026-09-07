import { describe, expect, it, vi } from "vitest";
import { ChangeSpaceViewUseCase } from "./change-space-view.use-case.js";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
import type { SpaceRepository } from "../../domain/ports.js";
import { buildSpace } from "../../../../../test/factories.js";

function buildRepository(overrides: Partial<SpaceRepository> = {}): SpaceRepository {
  return {
    findById: vi.fn(),
    findAllByOwner: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn(),
    ...overrides,
  };
}

describe("ChangeSpaceViewUseCase", () => {
  it("changes the view type for the owner's space", async () => {
    const space = buildSpace({ ownerId: "user-1", viewType: "LIST" });
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(space) });
    const useCase = new ChangeSpaceViewUseCase(repository);

    const result = await useCase.execute({ ownerId: "user-1", spaceId: "space-1", viewType: "CALENDAR" });

    expect(result.viewType).toBe("CALENDAR");
    expect(repository.save).toHaveBeenCalledWith(space);
  });

  it("throws NotFoundError when the space does not exist", async () => {
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new ChangeSpaceViewUseCase(repository);

    await expect(
      useCase.execute({ ownerId: "user-1", spaceId: "missing", viewType: "KANBAN" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError when the requester is not the owner", async () => {
    const space = buildSpace({ ownerId: "owner-1" });
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(space) });
    const useCase = new ChangeSpaceViewUseCase(repository);

    await expect(
      useCase.execute({ ownerId: "intruder", spaceId: "space-1", viewType: "KANBAN" }),
    ).rejects.toThrow(ForbiddenError);
  });
});
