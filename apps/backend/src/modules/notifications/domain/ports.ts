import { PushSubscription, PushSubscriptionProps } from "./push-subscription.entity.js";

/** Output port: persistence for push subscriptions. */
export interface PushSubscriptionRepository {
  findByEndpoint(endpoint: string): Promise<PushSubscription | null>;
  findAllByUser(userId: string): Promise<PushSubscription[]>;
  save(subscription: PushSubscription): Promise<void>;
  deleteByEndpoint(endpoint: string): Promise<void>;
}

export interface SubscribeInput {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezoneOffsetMinutes: number;
}

export interface UnsubscribeInput {
  userId: string;
  endpoint: string;
}

/** Input port: implemented by SubscribeUseCase. */
export interface SubscribeUseCase {
  execute(input: SubscribeInput): Promise<PushSubscriptionProps>;
}

/** Input port: implemented by UnsubscribeUseCase. */
export interface UnsubscribeUseCase {
  execute(input: UnsubscribeInput): Promise<void>;
}
