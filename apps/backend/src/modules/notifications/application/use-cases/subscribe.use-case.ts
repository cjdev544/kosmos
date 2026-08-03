import { randomUUID } from "node:crypto";
import { inject, injectable } from "tsyringe";
import { PushSubscription, PushSubscriptionProps } from "../../domain/push-subscription.entity.js";
import type {
  PushSubscriptionRepository,
  SubscribeInput,
  SubscribeUseCase as SubscribeUseCasePort,
} from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class SubscribeUseCase implements SubscribeUseCasePort {
  constructor(
    @inject(DI_TOKENS.PushSubscriptionRepository) private readonly subscriptionRepository: PushSubscriptionRepository,
  ) {}

  async execute(input: SubscribeInput): Promise<PushSubscriptionProps> {
    const existing = await this.subscriptionRepository.findByEndpoint(input.endpoint);

    const subscription = PushSubscription.create({
      id: existing?.id ?? randomUUID(),
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      timezoneOffsetMinutes: input.timezoneOffsetMinutes,
      lastDailySummaryDate: existing?.toSnapshot().lastDailySummaryDate ?? null,
      userId: input.userId,
      createdAt: existing?.toSnapshot().createdAt ?? new Date(),
    });

    await this.subscriptionRepository.save(subscription);
    return subscription.toSnapshot();
  }
}
