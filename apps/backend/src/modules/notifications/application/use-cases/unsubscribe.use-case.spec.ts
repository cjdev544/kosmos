import { describe, expect, it, vi } from "vitest";
import { UnsubscribeUseCase } from "./unsubscribe.use-case.js";
import { ForbiddenError } from "../../../../shared/domain/errors.js";
import type { PushSubscriptionRepository } from "../../domain/ports.js";
import { buildPushSubscription } from "../../../../../test/factories.js";

function buildRepository(overrides: Partial<PushSubscriptionRepository> = {}): PushSubscriptionRepository {
  return {
    findByEndpoint: vi.fn().mockResolvedValue(buildPushSubscription({ userId: "user-1" })),
    findAllByUser: vi.fn(),
    save: vi.fn(),
    deleteByEndpoint: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("UnsubscribeUseCase", () => {
  it("deletes the subscription owned by the requester", async () => {
    const repository = buildRepository();
    const useCase = new UnsubscribeUseCase(repository);

    await useCase.execute({ userId: "user-1", endpoint: "https://push.example.com/endpoint" });

    expect(repository.deleteByEndpoint).toHaveBeenCalledWith("https://push.example.com/endpoint");
  });

  it("does nothing when the subscription does not exist", async () => {
    const repository = buildRepository({ findByEndpoint: vi.fn().mockResolvedValue(null) });
    const useCase = new UnsubscribeUseCase(repository);

    await useCase.execute({ userId: "user-1", endpoint: "https://push.example.com/unknown" });

    expect(repository.deleteByEndpoint).not.toHaveBeenCalled();
  });

  it("throws ForbiddenError when the subscription belongs to another user", async () => {
    const repository = buildRepository({
      findByEndpoint: vi.fn().mockResolvedValue(buildPushSubscription({ userId: "owner-1" })),
    });
    const useCase = new UnsubscribeUseCase(repository);

    await expect(
      useCase.execute({ userId: "intruder", endpoint: "https://push.example.com/endpoint" }),
    ).rejects.toThrow(ForbiddenError);
    expect(repository.deleteByEndpoint).not.toHaveBeenCalled();
  });
});
