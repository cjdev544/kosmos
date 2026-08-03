import { httpClient } from "../../shared/lib/http-client";
import type { Subtask, Task, TaskPriority, TaskStatus } from "./types";

export function listTasks(spaceId: string): Promise<Task[]> {
  return httpClient.get<Task[]>(`/spaces/${spaceId}/tasks`);
}

export function createTask(
  spaceId: string,
  input: { title: string; description?: string; priority?: TaskPriority; dueDate?: string },
): Promise<Task> {
  return httpClient.post<Task>(`/spaces/${spaceId}/tasks`, input);
}

export function updateTaskStatus(spaceId: string, taskId: string, status: TaskStatus): Promise<Task> {
  return httpClient.patch<Task>(`/spaces/${spaceId}/tasks/${taskId}/status`, { status });
}

export function updateTask(
  spaceId: string,
  taskId: string,
  input: { title?: string; description?: string | null; priority?: TaskPriority; dueDate?: string | null },
): Promise<Task> {
  return httpClient.patch<Task>(`/spaces/${spaceId}/tasks/${taskId}`, input);
}

export function listMyTasks(): Promise<Task[]> {
  return httpClient.get<Task[]>("/tasks");
}

export function deleteTask(spaceId: string, taskId: string): Promise<void> {
  return httpClient.delete<void>(`/spaces/${spaceId}/tasks/${taskId}`);
}

export function reorderTasks(spaceId: string, taskIds: string[]): Promise<void> {
  return httpClient.patch<void>(`/spaces/${spaceId}/tasks/reorder`, { taskIds });
}

export function createSubtask(spaceId: string, taskId: string, input: { title: string }): Promise<Subtask> {
  return httpClient.post<Subtask>(`/spaces/${spaceId}/tasks/${taskId}/subtasks`, input);
}

export function updateSubtask(
  spaceId: string,
  taskId: string,
  subtaskId: string,
  input: { title?: string; done?: boolean },
): Promise<Subtask> {
  return httpClient.patch<Subtask>(`/spaces/${spaceId}/tasks/${taskId}/subtasks/${subtaskId}`, input);
}

export function deleteSubtask(spaceId: string, taskId: string, subtaskId: string): Promise<void> {
  return httpClient.delete<void>(`/spaces/${spaceId}/tasks/${taskId}/subtasks/${subtaskId}`);
}
