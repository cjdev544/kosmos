import { describe, expect, it, vi } from "vitest";
import { SubscribeUseCase } from "./subscribe.use-case.js";
import type { PushSubscriptionRepository } from "../../domain/ports.js";
import { buildPushSubscription } from "../../../../../test/factories.js";

function buildRepository(overrides: Partial<PushSubscriptionRepository> = {}): PushSubscriptionRepository {
  return {
    findByEndpoint: vi.fn().mockResolvedValue(null),
    findAllByUser: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    deleteByEndpoint: vi.fn(),
    ...overrides,
  };
}

describe("SubscribeUseCase", () => {
  it("creates a new subscription when the endpoint is unknown", async () => {
    const repository = buildRepository();
    const useCase = new SubscribeUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      endpoint: "https://push.example.com/new",
      p256dh: "p256dh",
      auth: "auth",
      timezoneOffsetMinutes: 60,
    });

    expect(result.userId).toBe("user-1");
    expect(result.endpoint).toBe("https://push.example.com/new");
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("reuses the existing subscription id and history when the endpoint is already known", async () => {
    const existing = buildPushSubscription({
      id: "existing-id",
      lastDailySummaryDate: "2026-01-15",
    });
    const repository = buildRepository({ findByEndpoint: vi.fn().mockResolvedValue(existing) });
    const useCase = new SubscribeUseCase(repository);

    const result = await useCase.execute({
      userId: "user-1",
      endpoint: existing.toSnapshot().endpoint,
      p256dh: "new-p256dh",
      auth: "new-auth",
      timezoneOffsetMinutes: -180,
    });

    expect(result.id).toBe("existing-id");
    expect(result.lastDailySummaryDate).toBe("2026-01-15");
    expect(result.p256dh).toBe("new-p256dh");
    expect(result.timezoneOffsetMinutes).toBe(-180);
  });
});
