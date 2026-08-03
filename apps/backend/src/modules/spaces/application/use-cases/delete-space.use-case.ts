import { inject, injectable } from "tsyringe";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
import type { DeleteSpaceInput, DeleteSpaceUseCase as DeleteSpaceUseCasePort, SpaceRepository } from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class DeleteSpaceUseCase implements DeleteSpaceUseCasePort {
  constructor(@inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository) {}

  async execute(input: DeleteSpaceInput): Promise<void> {
    const space = await this.spaceRepository.findById(input.spaceId);
    if (!space) {
      throw new NotFoundError("Espacio no encontrado");
    }
    if (space.ownerId !== input.ownerId) {
      throw new ForbiddenError("No eres propietario de este espacio");
    }

    await this.spaceRepository.delete(input.spaceId);
  }
}
