import { describe, expect, it, vi } from "vitest";
import { ApplyTemplateUseCase } from "./apply-template.use-case.js";
import { ValidationError } from "../../../../shared/domain/errors.js";
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

describe("ApplyTemplateUseCase", () => {
  it("throws ValidationError for an unknown template id", async () => {
    const repository = buildRepository();
    const useCase = new ApplyTemplateUseCase(repository);

    await expect(useCase.execute({ ownerId: "user-1", templateId: "does-not-exist" })).rejects.toThrow(
      ValidationError,
    );
  });

  it("creates every space defined by the template when the owner has none yet", async () => {
    const repository = buildRepository();
    const useCase = new ApplyTemplateUseCase(repository);

    const result = await useCase.execute({ ownerId: "user-1", templateId: "student" });

    expect(result).toHaveLength(2);
    expect(result.map((s) => s.name)).toEqual(["Estudios", "Bienestar"]);
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it("skips spaces whose name already exists for the owner", async () => {
    const repository = buildRepository({
      findAllByOwner: vi.fn().mockResolvedValue([buildSpace({ name: "Estudios" })]),
    });
    const useCase = new ApplyTemplateUseCase(repository);

    const result = await useCase.execute({ ownerId: "user-1", templateId: "student" });

    expect(result.map((s) => s.name)).toEqual(["Bienestar"]);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("positions new spaces after the owner's existing spaces", async () => {
    const repository = buildRepository({
      findAllByOwner: vi.fn().mockResolvedValue([buildSpace({ name: "Otro" })]),
    });
    const useCase = new ApplyTemplateUseCase(repository);

    const result = await useCase.execute({ ownerId: "user-1", templateId: "student" });

    expect(result.map((s) => s.position)).toEqual([1, 2]);
  });
});
