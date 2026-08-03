import { container } from "tsyringe";
import { DI_TOKENS } from "../../shared/infrastructure/di/tokens.js";
import { CreateTaskUseCase } from "./application/use-cases/create-task.use-case.js";
import { ListTasksUseCase } from "./application/use-cases/list-tasks.use-case.js";
import { UpdateTaskStatusUseCase } from "./application/use-cases/update-task-status.use-case.js";
import { ListMyTasksUseCase } from "./application/use-cases/list-my-tasks.use-case.js";
import { UpdateTaskUseCase } from "./application/use-cases/update-task.use-case.js";
import { CreateSubtaskUseCase } from "./application/use-cases/create-subtask.use-case.js";
import { UpdateSubtaskUseCase } from "./application/use-cases/update-subtask.use-case.js";
import { DeleteSubtaskUseCase } from "./application/use-cases/delete-subtask.use-case.js";
import { DeleteTaskUseCase } from "./application/use-cases/delete-task.use-case.js";
import { ReorderTasksUseCase } from "./application/use-cases/reorder-tasks.use-case.js";
import { PrismaTaskRepository } from "./infrastructure/persistence/prisma-task.repository.js";
import { PrismaSubtaskRepository } from "./infrastructure/persistence/prisma-subtask.repository.js";

export function registerTasksModule(): void {
  container.registerSingleton(DI_TOKENS.TaskRepository, PrismaTaskRepository);
  container.registerSingleton(DI_TOKENS.SubtaskRepository, PrismaSubtaskRepository);
  container.registerSingleton(DI_TOKENS.CreateTaskUseCase, CreateTaskUseCase);
  container.registerSingleton(DI_TOKENS.ListTasksUseCase, ListTasksUseCase);
  container.registerSingleton(DI_TOKENS.UpdateTaskStatusUseCase, UpdateTaskStatusUseCase);
  container.registerSingleton(DI_TOKENS.ListMyTasksUseCase, ListMyTasksUseCase);
  container.registerSingleton(DI_TOKENS.UpdateTaskUseCase, UpdateTaskUseCase);
  container.registerSingleton(DI_TOKENS.CreateSubtaskUseCase, CreateSubtaskUseCase);
  container.registerSingleton(DI_TOKENS.UpdateSubtaskUseCase, UpdateSubtaskUseCase);
  container.registerSingleton(DI_TOKENS.DeleteSubtaskUseCase, DeleteSubtaskUseCase);
  container.registerSingleton(DI_TOKENS.DeleteTaskUseCase, DeleteTaskUseCase);
  container.registerSingleton(DI_TOKENS.ReorderTasksUseCase, ReorderTasksUseCase);
}
