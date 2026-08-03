import { inject, injectable } from "tsyringe";
import { NotFoundError } from "../../../../shared/domain/errors.js";
import type {
  DeleteTaskInput,
  DeleteTaskUseCase as DeleteTaskUseCasePort,
  TaskRepository,
} from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import { assertSpaceOwnership } from "../assert-space-ownership.js";

@injectable()
export class DeleteTaskUseCase implements DeleteTaskUseCasePort {
  constructor(
    @inject(DI_TOKENS.TaskRepository) private readonly taskRepository: TaskRepository,
    @inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository,
  ) {}

  async execute(input: DeleteTaskInput): Promise<void> {
    await assertSpaceOwnership(this.spaceRepository, input.spaceId, input.requesterId);

    const task = await this.taskRepository.findById(input.taskId);
    if (!task || task.spaceId !== input.spaceId) {
      throw new NotFoundError("Tarea no encontrada");
    }

    await this.taskRepository.delete(input.taskId);
  }
}
