import { injectable } from "tsyringe";
import { prisma } from "../../../../shared/infrastructure/persistence/prisma-client.js";
import { PushSubscription, PushSubscriptionProps } from "../../domain/push-subscription.entity.js";
import type { PushSubscriptionRepository } from "../../domain/ports.js";

@injectable()
export class PrismaPushSubscriptionRepository implements PushSubscriptionRepository {
  async findByEndpoint(endpoint: string): Promise<PushSubscription | null> {
    const record = await prisma.pushSubscription.findUnique({ where: { endpoint } });
    return record ? this.toDomain(record) : null;
  }

  async findAllByUser(userId: string): Promise<PushSubscription[]> {
    const records = await prisma.pushSubscription.findMany({ where: { userId } });
    return records.map((record) => this.toDomain(record));
  }

  async save(subscription: PushSubscription): Promise<void> {
    const snapshot = subscription.toSnapshot();
    await prisma.pushSubscription.upsert({
      where: { endpoint: snapshot.endpoint },
      create: {
        id: snapshot.id,
        endpoint: snapshot.endpoint,
        p256dh: snapshot.p256dh,
        auth: snapshot.auth,
        timezoneOffsetMinutes: snapshot.timezoneOffsetMinutes,
        lastDailySummaryDate: snapshot.lastDailySummaryDate,
        userId: snapshot.userId,
      },
      update: {
        p256dh: snapshot.p256dh,
        auth: snapshot.auth,
        timezoneOffsetMinutes: snapshot.timezoneOffsetMinutes,
        userId: snapshot.userId,
      },
    });
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  private toDomain(record: PushSubscriptionProps): PushSubscription {
    return PushSubscription.create(record);
  }
}
