import { inject, injectable } from "tsyringe";
import { ForbiddenError } from "../../../../shared/domain/errors.js";
import type {
  PushSubscriptionRepository,
  UnsubscribeInput,
  UnsubscribeUseCase as UnsubscribeUseCasePort,
} from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class UnsubscribeUseCase implements UnsubscribeUseCasePort {
  constructor(
    @inject(DI_TOKENS.PushSubscriptionRepository) private readonly subscriptionRepository: PushSubscriptionRepository,
  ) {}

  async execute(input: UnsubscribeInput): Promise<void> {
    const subscription = await this.subscriptionRepository.findByEndpoint(input.endpoint);
    if (!subscription) return;
    if (subscription.userId !== input.userId) {
      throw new ForbiddenError("No eres propietario de esta suscripción");
    }

    await this.subscriptionRepository.deleteByEndpoint(input.endpoint);
  }
}
