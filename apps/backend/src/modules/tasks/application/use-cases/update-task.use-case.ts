import { inject, injectable } from "tsyringe";
import { NotFoundError } from "../../../../shared/domain/errors.js";
import { TaskProps } from "../../domain/task.entity.js";
import type { TaskRepository, UpdateTaskInput, UpdateTaskUseCase as UpdateTaskUseCasePort } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import { assertSpaceOwnership } from "../assert-space-ownership.js";

@injectable()
export class UpdateTaskUseCase implements UpdateTaskUseCasePort {
  constructor(
    @inject(DI_TOKENS.TaskRepository) private readonly taskRepository: TaskRepository,
    @inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository,
  ) {}

  async execute(input: UpdateTaskInput): Promise<TaskProps> {
    await assertSpaceOwnership(this.spaceRepository, input.spaceId, input.requesterId);

    const task = await this.taskRepository.findById(input.taskId);
    if (!task || task.spaceId !== input.spaceId) {
      throw new NotFoundError("Tarea no encontrada");
    }

    task.update({
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
    });
    await this.taskRepository.save(task);
    return task.toSnapshot();
  }
}
