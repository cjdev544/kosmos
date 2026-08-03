import { Task, TaskProps, TaskPriority } from "./task.entity.js";
import { TaskStatus } from "./task-status.vo.js";
import { Subtask, SubtaskProps } from "./subtask.entity.js";

/** Output port: persistence for tasks. */
export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findAllBySpace(spaceId: string): Promise<Task[]>;
  findAllByOwner(ownerId: string): Promise<Task[]>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
  reorder(taskIds: string[]): Promise<void>;
  countBySpaceAndIds(spaceId: string, taskIds: string[]): Promise<number>;
}

/** Output port: persistence for subtasks. */
export interface SubtaskRepository {
  findById(id: string): Promise<Subtask | null>;
  findAllByTask(taskId: string): Promise<Subtask[]>;
  save(subtask: Subtask): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface CreateTaskInput {
  requesterId: string;
  spaceId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
}

export interface ListTasksInput {
  requesterId: string;
  spaceId: string;
}

export interface UpdateTaskStatusInput {
  requesterId: string;
  spaceId: string;
  taskId: string;
  status: TaskStatus;
}

export interface UpdateTaskInput {
  requesterId: string;
  spaceId: string;
  taskId: string;
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export interface CreateSubtaskInput {
  requesterId: string;
  spaceId: string;
  taskId: string;
  title: string;
}

export interface UpdateSubtaskInput {
  requesterId: string;
  spaceId: string;
  taskId: string;
  subtaskId: string;
  title?: string;
  done?: boolean;
}

export interface DeleteSubtaskInput {
  requesterId: string;
  spaceId: string;
  taskId: string;
  subtaskId: string;
}

/** Input port: implemented by CreateTaskUseCase. */
export interface CreateTaskUseCase {
  execute(input: CreateTaskInput): Promise<TaskProps>;
}

/** Input port: implemented by ListTasksUseCase. */
export interface ListTasksUseCase {
  execute(input: ListTasksInput): Promise<TaskProps[]>;
}

/** Input port: implemented by UpdateTaskStatusUseCase. */
export interface UpdateTaskStatusUseCase {
  execute(input: UpdateTaskStatusInput): Promise<TaskProps>;
}

/** Input port: implemented by ListMyTasksUseCase. */
export interface ListMyTasksUseCase {
  execute(ownerId: string): Promise<TaskProps[]>;
}

/** Input port: implemented by UpdateTaskUseCase. */
export interface UpdateTaskUseCase {
  execute(input: UpdateTaskInput): Promise<TaskProps>;
}

/** Input port: implemented by CreateSubtaskUseCase. */
export interface CreateSubtaskUseCase {
  execute(input: CreateSubtaskInput): Promise<SubtaskProps>;
}

/** Input port: implemented by UpdateSubtaskUseCase. */
export interface UpdateSubtaskUseCase {
  execute(input: UpdateSubtaskInput): Promise<SubtaskProps>;
}

/** Input port: implemented by DeleteSubtaskUseCase. */
export interface DeleteSubtaskUseCase {
  execute(input: DeleteSubtaskInput): Promise<void>;
}

export interface DeleteTaskInput {
  requesterId: string;
  spaceId: string;
  taskId: string;
}

/** Input port: implemented by DeleteTaskUseCase. */
export interface DeleteTaskUseCase {
  execute(input: DeleteTaskInput): Promise<void>;
}

export interface ReorderTasksInput {
  requesterId: string;
  spaceId: string;
  taskIds: string[];
}

/** Input port: implemented by ReorderTasksUseCase. */
export interface ReorderTasksUseCase {
  execute(input: ReorderTasksInput): Promise<void>;
}
