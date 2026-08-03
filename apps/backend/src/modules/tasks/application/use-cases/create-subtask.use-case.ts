import { randomUUID } from "node:crypto";
import { inject, injectable } from "tsyringe";
import { NotFoundError } from "../../../../shared/domain/errors.js";
import { Subtask, SubtaskProps } from "../../domain/subtask.entity.js";
import type {
  CreateSubtaskInput,
  CreateSubtaskUseCase as CreateSubtaskUseCasePort,
  SubtaskRepository,
  TaskRepository,
} from "../../domain/ports.js";
import type { SpaceRepository } from "../../../spaces/domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";
import { assertSpaceOwnership } from "../assert-space-ownership.js";

@injectable()
export class CreateSubtaskUseCase implements CreateSubtaskUseCasePort {
  constructor(
    @inject(DI_TOKENS.TaskRepository) private readonly taskRepository: TaskRepository,
    @inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository,
    @inject(DI_TOKENS.SubtaskRepository) private readonly subtaskRepository: SubtaskRepository,
  ) {}

  async execute(input: CreateSubtaskInput): Promise<SubtaskProps> {
    await assertSpaceOwnership(this.spaceRepository, input.spaceId, input.requesterId);

    const task = await this.taskRepository.findById(input.taskId);
    if (!task || task.spaceId !== input.spaceId) {
      throw new NotFoundError("Tarea no encontrada");
    }

    const existing = await this.subtaskRepository.findAllByTask(input.taskId);
    const now = new Date();

    const subtask = Subtask.create({
      id: randomUUID(),
      title: input.title,
      done: false,
      position: existing.length,
      taskId: input.taskId,
      createdAt: now,
      updatedAt: now,
    });

    await this.subtaskRepository.save(subtask);
    return subtask.toSnapshot();
  }
}
