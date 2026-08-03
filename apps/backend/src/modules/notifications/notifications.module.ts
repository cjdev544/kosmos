import { container } from "tsyringe";
import { DI_TOKENS } from "../../shared/infrastructure/di/tokens.js";
import { SubscribeUseCase } from "./application/use-cases/subscribe.use-case.js";
import { UnsubscribeUseCase } from "./application/use-cases/unsubscribe.use-case.js";
import { PrismaPushSubscriptionRepository } from "./infrastructure/persistence/prisma-push-subscription.repository.js";

export function registerNotificationsModule(): void {
  container.registerSingleton(DI_TOKENS.PushSubscriptionRepository, PrismaPushSubscriptionRepository);
  container.registerSingleton(DI_TOKENS.SubscribeUseCase, SubscribeUseCase);
  container.registerSingleton(DI_TOKENS.UnsubscribeUseCase, UnsubscribeUseCase);
}
