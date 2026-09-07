import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    pushSubscription: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("../../../../shared/infrastructure/persistence/prisma-client.js", () => ({ prisma: prismaMock }));

const { PrismaPushSubscriptionRepository } = await import("./prisma-push-subscription.repository.js");
const { PushSubscription } = await import("../../domain/push-subscription.entity.js");

const subscriptionRecord = {
  id: "subscription-1",
  endpoint: "https://push.example.com/endpoint",
  p256dh: "p256dh-key",
  auth: "auth-key",
  timezoneOffsetMinutes: 0,
  lastDailySummaryDate: null,
  userId: "user-1",
  createdAt: new Date("2026-01-01"),
};

describe("PrismaPushSubscriptionRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findByEndpoint maps a found record to a domain PushSubscription", async () => {
    prismaMock.pushSubscription.findUnique.mockResolvedValue(subscriptionRecord);
    const repository = new PrismaPushSubscriptionRepository();

    const subscription = await repository.findByEndpoint("https://push.example.com/endpoint");

    expect(prismaMock.pushSubscription.findUnique).toHaveBeenCalledWith({
      where: { endpoint: "https://push.example.com/endpoint" },
    });
    expect(subscription?.userId).toBe("user-1");
  });

  it("findByEndpoint returns null when no record is found", async () => {
    prismaMock.pushSubscription.findUnique.mockResolvedValue(null);
    const repository = new PrismaPushSubscriptionRepository();

    expect(await repository.findByEndpoint("missing")).toBeNull();
  });

  it("findAllByUser filters by userId", async () => {
    prismaMock.pushSubscription.findMany.mockResolvedValue([subscriptionRecord]);
    const repository = new PrismaPushSubscriptionRepository();

    const subscriptions = await repository.findAllByUser("user-1");

    expect(prismaMock.pushSubscription.findMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(subscriptions).toHaveLength(1);
  });

  it("save upserts the subscription by endpoint", async () => {
    prismaMock.pushSubscription.upsert.mockResolvedValue(subscriptionRecord);
    const repository = new PrismaPushSubscriptionRepository();
    const subscription = PushSubscription.create(subscriptionRecord);

    await repository.save(subscription);

    expect(prismaMock.pushSubscription.upsert).toHaveBeenCalledWith({
      where: { endpoint: "https://push.example.com/endpoint" },
      create: {
        id: "subscription-1",
        endpoint: "https://push.example.com/endpoint",
        p256dh: "p256dh-key",
        auth: "auth-key",
        timezoneOffsetMinutes: 0,
        lastDailySummaryDate: null,
        userId: "user-1",
      },
      update: {
        p256dh: "p256dh-key",
        auth: "auth-key",
        timezoneOffsetMinutes: 0,
        userId: "user-1",
      },
    });
  });

  it("deleteByEndpoint removes subscriptions matching the endpoint", async () => {
    const repository = new PrismaPushSubscriptionRepository();

    await repository.deleteByEndpoint("https://push.example.com/endpoint");

    expect(prismaMock.pushSubscription.deleteMany).toHaveBeenCalledWith({
      where: { endpoint: "https://push.example.com/endpoint" },
    });
  });
});
