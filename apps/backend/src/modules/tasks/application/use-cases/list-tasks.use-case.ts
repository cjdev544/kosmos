import { inject, injectable } from "tsyringe";
import { TaskProps } from "../../domain/task.entity.js";
import type { ListTasksInput, ListTasksUseCase as ListTasksUseCasePort, TaskRepository } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import { assertSpaceOwnership } from "../assert-space-ownership.js";

@injectable()
export class ListTasksUseCase implements ListTasksUseCasePort {
  constructor(
    @inject(DI_TOKENS.TaskRepository) private readonly taskRepository: TaskRepository,
    @inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository,
  ) {}

  async execute(input: ListTasksInput): Promise<TaskProps[]> {
    await assertSpaceOwnership(this.spaceRepository, input.spaceId, input.requesterId);
    const tasks = await this.taskRepository.findAllBySpace(input.spaceId);
    return tasks.map((task) => task.toSnapshot());
  }
}
