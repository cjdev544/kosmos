import "reflect-metadata";
import "./shared/infrastructure/config/zod-es.js";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./shared/infrastructure/config/env.js";
import { errorHandler, notFoundHandler } from "./shared/infrastructure/http/error-handler.middleware.js";
import { registerAuthModule } from "./modules/auth/auth.module.js";
import { registerSpacesModule } from "./modules/spaces/spaces.module.js";
import { registerTasksModule } from "./modules/tasks/tasks.module.js";
import { registerNotificationsModule } from "./modules/notifications/notifications.module.js";
import { createAuthRouter } from "./modules/auth/infrastructure/http/auth.router.js";
import { createSpaceRouter } from "./modules/spaces/infrastructure/http/space.router.js";
import { createTaskRouter, createMyTasksRouter } from "./modules/tasks/infrastructure/http/task.router.js";
import { createNotificationRouter } from "./modules/notifications/infrastructure/http/notification.router.js";

export function createApp(): Express {
  registerAuthModule();
  registerSpacesModule();
  registerTasksModule();
  registerNotificationsModule();

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", createAuthRouter());
  app.use("/api/spaces", createSpaceRouter());
  app.use("/api/spaces/:spaceId/tasks", createTaskRouter());
  app.use("/api/tasks", createMyTasksRouter());
  app.use("/api/notifications", createNotificationRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
