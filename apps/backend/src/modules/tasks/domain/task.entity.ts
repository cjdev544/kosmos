import { ValidationError } from "../../../shared/domain/errors.js";
import { TaskStatus } from "./task-status.vo.js";
import type { SubtaskProps } from "./subtask.entity.js";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskProps {
  id: string;
  title: string;
  description: string | null;
  subtasks: SubtaskProps[];
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  position: number;
  spaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Task {
  private constructor(private props: TaskProps) {}

  static create(props: TaskProps): Task {
    if (props.title.trim().length === 0) {
      throw new ValidationError("El título de la tarea no puede estar vacío");
    }
    return new Task(props);
  }

  get id(): string {
    return this.props.id;
  }

  get spaceId(): string {
    return this.props.spaceId;
  }

  changeStatus(status: TaskStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  update(changes: {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    dueDate?: Date | null;
  }): void {
    if (changes.title !== undefined) {
      if (changes.title.trim().length === 0) {
        throw new ValidationError("El título de la tarea no puede estar vacío");
      }
      this.props.title = changes.title;
    }
    if (changes.description !== undefined) this.props.description = changes.description;
    if (changes.priority !== undefined) this.props.priority = changes.priority;
    if (changes.dueDate !== undefined) this.props.dueDate = changes.dueDate;
    this.props.updatedAt = new Date();
  }

  toSnapshot(): TaskProps {
    return { ...this.props, subtasks: [...this.props.subtasks] };
  }
}
