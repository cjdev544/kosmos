import { useCallback, useEffect, useState } from "react";
import * as tasksApi from "./api";
import type { Subtask, Task, TaskPriority, TaskStatus } from "./types";

export function useMyTasks(): {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (spaceId: string, input: { title: string; dueDate?: string; priority?: TaskPriority }) => Promise<void>;
  updateTask: (spaceId: string, taskId: string, input: { title?: string; description?: string | null; priority?: TaskPriority; dueDate?: string | null }) => Promise<void>;
  updateStatus: (spaceId: string, taskId: string, status: TaskStatus) => Promise<void>;
  addSubtask: (spaceId: string, taskId: string, title: string) => Promise<Subtask>;
  toggleSubtask: (spaceId: string, taskId: string, subtaskId: string, done: boolean) => Promise<void>;
  deleteSubtask: (spaceId: string, taskId: string, subtaskId: string) => Promise<void>;
  deleteTask: (spaceId: string, taskId: string) => Promise<void>;
} {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await tasksApi.listMyTasks());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando tareas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    tasks,
    loading,
    error,
    createTask: async (spaceId, input) => {
      const task = await tasksApi.createTask(spaceId, input);
      setTasks((prev) => [...prev, task]);
    },
    updateTask: async (spaceId, taskId, input) => {
      const updated = await tasksApi.updateTask(spaceId, taskId, input);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    },
    updateStatus: async (spaceId, taskId, status) => {
      const updated = await tasksApi.updateTaskStatus(spaceId, taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    },
    addSubtask: async (spaceId, taskId, title) => {
      const sub = await tasksApi.createSubtask(spaceId, taskId, { title });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, sub] } : t)));
      return sub;
    },
    toggleSubtask: async (spaceId, taskId, subtaskId, done) => {
      const sub = await tasksApi.updateSubtask(spaceId, taskId, subtaskId, { done });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? sub : s)) } : t)),
      );
    },
    deleteSubtask: async (spaceId, taskId, subtaskId) => {
      await tasksApi.deleteSubtask(spaceId, taskId, subtaskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) } : t)),
      );
    },
    deleteTask: async (spaceId, taskId) => {
      await tasksApi.deleteTask(spaceId, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    },
  };
}
