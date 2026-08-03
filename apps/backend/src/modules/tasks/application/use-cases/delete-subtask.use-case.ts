import { inject, injectable } from "tsyringe";
import { NotFoundError } from "../../../../shared/domain/errors.js";
import type {
  DeleteSubtaskInput,
  DeleteSubtaskUseCase as DeleteSubtaskUseCasePort,
  SubtaskRepository,
  TaskRepository,
} from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import { assertSpaceOwnership } from "../assert-space-ownership.js";

@injectable()
export class DeleteSubtaskUseCase implements DeleteSubtaskUseCasePort {
  constructor(
    @inject(DI_TOKENS.TaskRepository) private readonly taskRepository: TaskRepository,
    @inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository,
    @inject(DI_TOKENS.SubtaskRepository) private readonly subtaskRepository: SubtaskRepository,
  ) {}

  async execute(input: DeleteSubtaskInput): Promise<void> {
    await assertSpaceOwnership(this.spaceRepository, input.spaceId, input.requesterId);

    const task = await this.taskRepository.findById(input.taskId);
    if (!task || task.spaceId !== input.spaceId) {
      throw new NotFoundError("Tarea no encontrada");
    }

    const subtask = await this.subtaskRepository.findById(input.subtaskId);
    if (!subtask || subtask.taskId !== input.taskId) {
      throw new NotFoundError("Subtarea no encontrada");
    }

    await this.subtaskRepository.delete(input.subtaskId);
  }
}
