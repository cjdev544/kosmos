import webpush from "web-push";
import { prisma } from "../persistence/prisma-client.js";
import { env } from "../config/env.js";

const REMINDER_LEAD_MINUTES = 15;
const DAILY_SUMMARY_HOUR = 8;
const TICK_INTERVAL_MS = 60_000;

webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function hasExplicitTime(date: Date): boolean {
  return !(date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0);
}

async function sendToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string },
): Promise<void> {
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload),
    );
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: subscription.endpoint } });
    } else {
      console.error("Error enviando push:", error);
    }
  }
}

async function runDailySummaries(now: Date): Promise<void> {
  const subscriptions = await prisma.pushSubscription.findMany();

  for (const sub of subscriptions) {
    const localNow = new Date(now.getTime() - sub.timezoneOffsetMinutes * 60_000);
    const localDateStr = `${localNow.getUTCFullYear()}-${pad(localNow.getUTCMonth() + 1)}-${pad(localNow.getUTCDate())}`;

    if (localNow.getUTCHours() !== DAILY_SUMMARY_HOUR || localNow.getUTCMinutes() !== 0) continue;
    if (sub.lastDailySummaryDate === localDateStr) continue;

    const utcDayStart = new Date(
      Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate(), 0, 0, 0) +
        sub.timezoneOffsetMinutes * 60_000,
    );
    const utcDayEnd = new Date(utcDayStart.getTime() + 24 * 60 * 60_000);

    const tasksToday = await prisma.task.count({
      where: {
        space: { ownerId: sub.userId },
        status: { not: "DONE" },
        dueDate: { gte: utcDayStart, lt: utcDayEnd },
      },
    });

    if (tasksToday > 0) {
      await sendToSubscription(sub, {
        title: "Tareas de hoy",
        body: `Tienes ${tasksToday} tarea(s) pendiente(s) hoy.`,
      });
    }

    await prisma.pushSubscription.update({ where: { id: sub.id }, data: { lastDailySummaryDate: localDateStr } });
  }
}

async function runTaskReminders(now: Date): Promise<void> {
  const windowStart = new Date(now.getTime() + (REMINDER_LEAD_MINUTES - 1) * 60_000);
  const windowEnd = new Date(now.getTime() + REMINDER_LEAD_MINUTES * 60_000);

  const dueTasks = await prisma.task.findMany({
    where: {
      status: { not: "DONE" },
      reminderSentAt: null,
      dueDate: { gte: windowStart, lt: windowEnd },
    },
    include: { space: true },
  });

  for (const task of dueTasks) {
    if (!task.dueDate || !hasExplicitTime(task.dueDate)) continue;

    const subscriptions = await prisma.pushSubscription.findMany({ where: { userId: task.space.ownerId } });
    for (const sub of subscriptions) {
      await sendToSubscription(sub, {
        title: task.title,
        body: `En ${REMINDER_LEAD_MINUTES} minutos · ${task.space.name}`,
      });
    }

    await prisma.task.update({ where: { id: task.id }, data: { reminderSentAt: now } });
  }
}

export function startNotificationScheduler(): NodeJS.Timeout {
  return setInterval(() => {
    const now = new Date();
    runDailySummaries(now).catch((error) => console.error("Error en resumen diario:", error));
    runTaskReminders(now).catch((error) => console.error("Error en recordatorios:", error));
  }, TICK_INTERVAL_MS);
}
