import { useCallback, useEffect, useState } from "react";
import * as tasksApi from "./api";
import type { Subtask, Task, TaskPriority, TaskStatus } from "./types";

export function useTasks(spaceId: string): {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (input: { title: string; description?: string; priority?: TaskPriority; dueDate?: string }) => Promise<void>;
  updateTask: (taskId: string, input: { title?: string; description?: string | null; priority?: TaskPriority; dueDate?: string | null }) => Promise<void>;
  updateStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<Subtask>;
  toggleSubtask: (taskId: string, subtaskId: string, done: boolean) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  reorderTasks: (taskIds: string[]) => Promise<void>;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await tasksApi.listTasks(spaceId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando tareas");
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    reload();
  }, [reload]);

  function patchTask(taskId: string, changes: Partial<Task>): void {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...changes } : t)));
  }

  return {
    tasks,
    loading,
    error,
    createTask: async (input) => {
      const task = await tasksApi.createTask(spaceId, input);
      setTasks((prev) => [...prev, task]);
    },
    updateTask: async (taskId, input) => {
      const updated = await tasksApi.updateTask(spaceId, taskId, input);
      patchTask(taskId, updated);
    },
    updateStatus: async (taskId, status) => {
      const updated = await tasksApi.updateTaskStatus(spaceId, taskId, status);
      patchTask(taskId, updated);
    },
    addSubtask: async (taskId, title) => {
      const subtask = await tasksApi.createSubtask(spaceId, taskId, { title });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t)),
      );
      return subtask;
    },
    toggleSubtask: async (taskId, subtaskId, done) => {
      const updated = await tasksApi.updateSubtask(spaceId, taskId, subtaskId, { done });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? updated : s)) }
            : t,
        ),
      );
    },
    deleteSubtask: async (taskId, subtaskId) => {
      await tasksApi.deleteSubtask(spaceId, taskId, subtaskId);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) } : t,
        ),
      );
    },
    deleteTask: async (taskId) => {
      await tasksApi.deleteTask(spaceId, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
    reorderTasks: async (taskIds) => {
      setTasks((prev) => {
        const byId = new Map(prev.map((t) => [t.id, t]));
        const reordered = taskIds.map((id) => byId.get(id)!).filter(Boolean);
        const rest = prev.filter((t) => !taskIds.includes(t.id));
        return [...reordered, ...rest];
      });
      await tasksApi.reorderTasks(spaceId, taskIds);
    },
  };
}
