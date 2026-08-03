import { z } from "zod";
import { TASK_STATUSES } from "../../domain/task-status.vo.js";

const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z.union([z.coerce.date(), z.null()]).optional(),
});

export const reorderTasksSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(1),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskStatusDto = z.infer<typeof updateTaskStatusSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type CreateSubtaskDto = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskDto = z.infer<typeof updateSubtaskSchema>;
