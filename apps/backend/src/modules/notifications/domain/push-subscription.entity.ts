export interface PushSubscriptionProps {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezoneOffsetMinutes: number;
  lastDailySummaryDate: string | null;
  userId: string;
  createdAt: Date;
}

export class PushSubscription {
  private constructor(private props: PushSubscriptionProps) {}

  static create(props: PushSubscriptionProps): PushSubscription {
    return new PushSubscription(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  toSnapshot(): PushSubscriptionProps {
    return { ...this.props };
  }
}
