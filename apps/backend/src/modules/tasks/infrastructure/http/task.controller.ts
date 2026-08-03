import type { Response } from "express";
import { inject, injectable } from "tsyringe";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import type { AuthenticatedRequest } from "../../../../shared/infrastructure/http/auth.middleware.js";
import { UnauthorizedError } from "../../../../shared/domain/errors.js";
import type {
  CreateSubtaskUseCase,
  CreateTaskUseCase,
  DeleteSubtaskUseCase,
  DeleteTaskUseCase,
  ListMyTasksUseCase,
  ListTasksUseCase,
  ReorderTasksUseCase,
  UpdateSubtaskUseCase,
  UpdateTaskStatusUseCase,
  UpdateTaskUseCase,
} from "../../domain/ports.js";
import {
  createSubtaskSchema,
  createTaskSchema,
  reorderTasksSchema,
  updateSubtaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "./task.schemas.js";

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.userId) {
    throw new UnauthorizedError("Se requiere autenticación");
  }
  return req.userId;
}

@injectable()
export class TaskController {
  constructor(
    @inject(DI_TOKENS.CreateTaskUseCase) private readonly createTaskUseCase: CreateTaskUseCase,
    @inject(DI_TOKENS.ListTasksUseCase) private readonly listTasksUseCase: ListTasksUseCase,
    @inject(DI_TOKENS.UpdateTaskStatusUseCase) private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    @inject(DI_TOKENS.ListMyTasksUseCase) private readonly listMyTasksUseCase: ListMyTasksUseCase,
    @inject(DI_TOKENS.UpdateTaskUseCase) private readonly updateTaskUseCase: UpdateTaskUseCase,
    @inject(DI_TOKENS.CreateSubtaskUseCase) private readonly createSubtaskUseCase: CreateSubtaskUseCase,
    @inject(DI_TOKENS.UpdateSubtaskUseCase) private readonly updateSubtaskUseCase: UpdateSubtaskUseCase,
    @inject(DI_TOKENS.DeleteSubtaskUseCase) private readonly deleteSubtaskUseCase: DeleteSubtaskUseCase,
    @inject(DI_TOKENS.DeleteTaskUseCase) private readonly deleteTaskUseCase: DeleteTaskUseCase,
    @inject(DI_TOKENS.ReorderTasksUseCase) private readonly reorderTasksUseCase: ReorderTasksUseCase,
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    const dto = createTaskSchema.parse(req.body);
    const task = await this.createTaskUseCase.execute({
      requesterId,
      spaceId: req.params.spaceId!,
      ...dto,
    });
    res.status(201).json(task);
  };

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    const tasks = await this.listTasksUseCase.execute({ requesterId, spaceId: req.params.spaceId! });
    res.status(200).json(tasks);
  };

  updateStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    const dto = updateTaskStatusSchema.parse(req.body);
    const task = await this.updateTaskStatusUseCase.execute({
      requesterId,
      spaceId: req.params.spaceId!,
      taskId: req.params.taskId!,
      status: dto.status,
    });
    res.status(200).json(task);
  };

  listMine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    const tasks = await this.listMyTasksUseCase.execute(requesterId);
    res.status(200).json(tasks);
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    const dto = updateTaskSchema.parse(req.body);
    const task = await this.updateTaskUseCase.execute({
      requesterId,
      spaceId: req.params.spaceId!,
      taskId: req.params.taskId!,
      ...dto,
    });
    res.status(200).json(task);
  };

  createSubtask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    const dto = createSubtaskSchema.parse(req.body);
    const subtask = await this.createSubtaskUseCase.execute({
      requesterId,
      spaceId: req.params.spaceId!,
      taskId: req.params.taskId!,
      title: dto.title,
    });
    res.status(201).json(subtask);
  };

  updateSubtask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    const dto = updateSubtaskSchema.parse(req.body);
    const subtask = await this.updateSubtaskUseCase.execute({
      requesterId,
      spaceId: req.params.spaceId!,
      taskId: req.params.taskId!,
      subtaskId: req.params.subtaskId!,
      ...dto,
    });
    res.status(200).json(subtask);
  };

  deleteSubtask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    await this.deleteSubtaskUseCase.execute({
      requesterId,
      spaceId: req.params.spaceId!,
      taskId: req.params.taskId!,
      subtaskId: req.params.subtaskId!,
    });
    res.status(204).send();
  };

  reorderTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    const { taskIds } = reorderTasksSchema.parse(req.body);
    await this.reorderTasksUseCase.execute({ requesterId, spaceId: req.params.spaceId!, taskIds });
    res.status(204).send();
  };

  deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requesterId = requireUserId(req);
    await this.deleteTaskUseCase.execute({
      requesterId,
      spaceId: req.params.spaceId!,
      taskId: req.params.taskId!,
    });
    res.status(204).send();
  };
}
