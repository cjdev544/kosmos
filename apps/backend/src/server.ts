import { createApp } from "./app.js";
import { env } from "./shared/infrastructure/config/env.js";
import { startNotificationScheduler } from "./shared/infrastructure/jobs/notification-scheduler.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Kosmos backend listening on port ${env.PORT}`);
});

startNotificationScheduler();
