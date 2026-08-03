import { randomUUID } from "node:crypto";
import { inject, injectable } from "tsyringe";
import { Task, TaskProps } from "../../domain/task.entity.js";
import type { CreateTaskInput, CreateTaskUseCase as CreateTaskUseCasePort, TaskRepository } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import { assertSpaceOwnership } from "../assert-space-ownership.js";

@injectable()
export class CreateTaskUseCase implements CreateTaskUseCasePort {
  constructor(
    @inject(DI_TOKENS.TaskRepository) private readonly taskRepository: TaskRepository,
    @inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository,
  ) {}

  async execute(input: CreateTaskInput): Promise<TaskProps> {
    await assertSpaceOwnership(this.spaceRepository, input.spaceId, input.requesterId);

    const existingTasks = await this.taskRepository.findAllBySpace(input.spaceId);
    const now = new Date();

    const task = Task.create({
      id: randomUUID(),
      title: input.title,
      description: input.description ?? null,
      subtasks: [],
      status: "TODO",
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate ?? null,
      position: existingTasks.length,
      spaceId: input.spaceId,
      createdAt: now,
      updatedAt: now,
    });

    await this.taskRepository.save(task);
    return task.toSnapshot();
  }
}
