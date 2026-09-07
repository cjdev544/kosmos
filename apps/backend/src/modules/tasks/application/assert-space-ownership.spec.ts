import { describe, expect, it, vi } from "vitest";
import { assertSpaceOwnership } from "./assert-space-ownership.js";
import { ForbiddenError, NotFoundError } from "../../../shared/domain/errors.js";
import type { SpaceRepository } from "../../spaces/domain/ports.js";
import { buildSpace } from "../../../../test/factories.js";

function buildSpaceRepository(overrides: Partial<SpaceRepository> = {}): SpaceRepository {
  return {
    findById: vi.fn(),
    findAllByOwner: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

describe("assertSpaceOwnership", () => {
  it("resolves when the space exists and belongs to the requester", async () => {
    const space = buildSpace({ ownerId: "owner-1" });
    const repository = buildSpaceRepository({ findById: vi.fn().mockResolvedValue(space) });

    await expect(assertSpaceOwnership(repository, "space-1", "owner-1")).resolves.toBeUndefined();
  });

  it("throws NotFoundError when the space does not exist", async () => {
    const repository = buildSpaceRepository({ findById: vi.fn().mockResolvedValue(null) });

    await expect(assertSpaceOwnership(repository, "space-1", "owner-1")).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError when the requester is not the owner", async () => {
    const space = buildSpace({ ownerId: "owner-1" });
    const repository = buildSpaceRepository({ findById: vi.fn().mockResolvedValue(space) });

    await expect(assertSpaceOwnership(repository, "space-1", "someone-else")).rejects.toThrow(ForbiddenError);
  });
});
