import { User, UserProps } from "../src/modules/auth/domain/user.entity.js";
import { Space, SpaceProps } from "../src/modules/spaces/domain/space.entity.js";
import { Task, TaskProps } from "../src/modules/tasks/domain/task.entity.js";
import { Subtask, SubtaskProps } from "../src/modules/tasks/domain/subtask.entity.js";
import { PushSubscription, PushSubscriptionProps } from "../src/modules/notifications/domain/push-subscription.entity.js";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

export function buildUser(overrides: Partial<UserProps> = {}): User {
  return User.create({
    id: "user-1",
    email: "user@example.com",
    passwordHash: "hashed-password",
    name: "Test User",
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  });
}

export function buildSpace(overrides: Partial<SpaceProps> = {}): Space {
  return Space.create({
    id: "space-1",
    name: "Test Space",
    icon: null,
    color: null,
    viewType: "LIST",
    isActive: true,
    position: 0,
    ownerId: "user-1",
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  });
}

export function buildTask(overrides: Partial<TaskProps> = {}): Task {
  return Task.create({
    id: "task-1",
    title: "Test Task",
    description: null,
    subtasks: [],
    status: "TODO",
    priority: "MEDIUM",
    dueDate: null,
    position: 0,
    spaceId: "space-1",
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  });
}

export function buildSubtask(overrides: Partial<SubtaskProps> = {}): Subtask {
  return Subtask.create({
    id: "subtask-1",
    title: "Test Subtask",
    done: false,
    position: 0,
    taskId: "task-1",
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  });
}

export function buildPushSubscription(overrides: Partial<PushSubscriptionProps> = {}): PushSubscription {
  return PushSubscription.create({
    id: "subscription-1",
    endpoint: "https://push.example.com/endpoint",
    p256dh: "p256dh-key",
    auth: "auth-key",
    timezoneOffsetMinutes: 0,
    lastDailySummaryDate: null,
    userId: "user-1",
    createdAt: FIXED_DATE,
    ...overrides,
  });
}
