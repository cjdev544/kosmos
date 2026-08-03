export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  position: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  subtasks: Subtask[];
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  spaceId: string;
}
