import { describe, expect, it, vi } from "vitest";
import { DeleteSpaceUseCase } from "./delete-space.use-case.js";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
import type { SpaceRepository } from "../../domain/ports.js";
import { buildSpace } from "../../../../../test/factories.js";

function buildRepository(overrides: Partial<SpaceRepository> = {}): SpaceRepository {
  return {
    findById: vi.fn(),
    findAllByOwner: vi.fn(),
    save: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("DeleteSpaceUseCase", () => {
  it("deletes the owner's space", async () => {
    const space = buildSpace({ ownerId: "user-1" });
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(space) });
    const useCase = new DeleteSpaceUseCase(repository);

    await useCase.execute({ ownerId: "user-1", spaceId: "space-1" });

    expect(repository.delete).toHaveBeenCalledWith("space-1");
  });

  it("throws NotFoundError when the space does not exist", async () => {
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new DeleteSpaceUseCase(repository);

    await expect(useCase.execute({ ownerId: "user-1", spaceId: "missing" })).rejects.toThrow(NotFoundError);
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("throws ForbiddenError when the requester is not the owner", async () => {
    const space = buildSpace({ ownerId: "owner-1" });
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(space) });
    const useCase = new DeleteSpaceUseCase(repository);

    await expect(useCase.execute({ ownerId: "intruder", spaceId: "space-1" })).rejects.toThrow(ForbiddenError);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
