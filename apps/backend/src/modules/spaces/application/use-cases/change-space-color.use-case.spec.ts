import { describe, expect, it, vi } from "vitest";
import { ChangeSpaceColorUseCase } from "./change-space-color.use-case.js";
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

describe("ChangeSpaceColorUseCase", () => {
  it("changes the color for the owner's space", async () => {
    const space = buildSpace({ ownerId: "user-1", color: null });
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(space) });
    const useCase = new ChangeSpaceColorUseCase(repository);

    const result = await useCase.execute({ ownerId: "user-1", spaceId: "space-1", color: "#123456" });

    expect(result.color).toBe("#123456");
  });

  it("allows clearing the color by passing null", async () => {
    const space = buildSpace({ ownerId: "user-1", color: "#123456" });
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(space) });
    const useCase = new ChangeSpaceColorUseCase(repository);

    const result = await useCase.execute({ ownerId: "user-1", spaceId: "space-1", color: null });

    expect(result.color).toBeNull();
  });

  it("throws NotFoundError when the space does not exist", async () => {
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new ChangeSpaceColorUseCase(repository);

    await expect(
      useCase.execute({ ownerId: "user-1", spaceId: "missing", color: "#000000" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError when the requester is not the owner", async () => {
    const space = buildSpace({ ownerId: "owner-1" });
    const repository = buildRepository({ findById: vi.fn().mockResolvedValue(space) });
    const useCase = new ChangeSpaceColorUseCase(repository);

    await expect(
      useCase.execute({ ownerId: "intruder", spaceId: "space-1", color: "#000000" }),
    ).rejects.toThrow(ForbiddenError);
  });
});
