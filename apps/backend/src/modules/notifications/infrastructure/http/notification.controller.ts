import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import { env } from "../../../../shared/infrastructure/config/env.js";
import type { AuthenticatedRequest } from "../../../../shared/infrastructure/http/auth.middleware.js";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import type { SubscribeUseCase, UnsubscribeUseCase } from "../../domain/ports.js";
import { subscribeSchema, unsubscribeSchema } from "./notification.schemas.js";

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.userId) {
    throw new UnauthorizedError("Se requiere autenticación");
  }
  return req.userId;
}

@injectable()
export class NotificationController {
  constructor(
    @inject(DI_TOKENS.SubscribeUseCase) private readonly subscribeUseCase: SubscribeUseCase,
    @inject(DI_TOKENS.UnsubscribeUseCase) private readonly unsubscribeUseCase: UnsubscribeUseCase,
  ) {}

  publicKey = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.status(200).json({ publicKey: env.VAPID_PUBLIC_KEY });
  };

  subscribe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = requireUserId(req);
    const dto = subscribeSchema.parse(req.body);
    const subscription = await this.subscribeUseCase.execute({
      userId,
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
      timezoneOffsetMinutes: dto.timezoneOffsetMinutes,
    });
    res.status(201).json(subscription);
  };

  unsubscribe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = requireUserId(req);
    const dto = unsubscribeSchema.parse(req.body);
    await this.unsubscribeUseCase.execute({ userId, endpoint: dto.endpoint });
    res.status(204).send();
  };
}
