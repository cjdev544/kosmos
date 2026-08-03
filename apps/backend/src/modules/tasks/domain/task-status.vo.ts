import { ValidationError } from "../../../shared/domain/errors.js";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export function assertTaskStatus(value: string): TaskStatus {
  if (!TASK_STATUSES.includes(value as TaskStatus)) {
    throw new ValidationError(`Estado de tarea inválido: ${value}`);
  }
  return value as TaskStatus;
}
