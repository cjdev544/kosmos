import { inject, injectable } from "tsyringe";
import type { ReorderTasksInput, ReorderTasksUseCase as ReorderTasksUseCasePort, TaskRepository } from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import { assertSpaceOwnership } from "../assert-space-ownership.js";
import { ValidationError } from "../../../../shared/domain/errors.js";

@injectable()
export class ReorderTasksUseCase implements ReorderTasksUseCasePort {
  constructor(
    @inject(DI_TOKENS.TaskRepository) private readonly taskRepository: TaskRepository,
    @inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository,
  ) {}

  async execute(input: ReorderTasksInput): Promise<void> {
    await assertSpaceOwnership(this.spaceRepository, input.spaceId, input.requesterId);
    const count = await this.taskRepository.countBySpaceAndIds(input.spaceId, input.taskIds);
    if (count !== input.taskIds.length) {
      throw new ValidationError("Una o más tareas no pertenecen a este espacio");
    }
    await this.taskRepository.reorder(input.taskIds);
  }
}
