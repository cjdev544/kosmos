import { inject, injectable } from "tsyringe";
import { TaskProps } from "../../domain/task.entity.js";
import type { ListMyTasksUseCase as ListMyTasksUseCasePort, TaskRepository } from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class ListMyTasksUseCase implements ListMyTasksUseCasePort {
  constructor(@inject(DI_TOKENS.TaskRepository) private readonly taskRepository: TaskRepository) {}

  async execute(ownerId: string): Promise<TaskProps[]> {
    const tasks = await this.taskRepository.findAllByOwner(ownerId);
    return tasks.map((task) => task.toSnapshot());
  }
}
