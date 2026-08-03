import { inject, injectable } from "tsyringe";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
import { SpaceProps } from "../../domain/space.entity.js";
import type { SpaceRepository, ToggleSpaceInput, ToggleSpaceUseCase as ToggleSpaceUseCasePort } from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class ToggleSpaceUseCase implements ToggleSpaceUseCasePort {
  constructor(@inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository) {}

  async execute(input: ToggleSpaceInput): Promise<SpaceProps> {
    const space = await this.spaceRepository.findById(input.spaceId);
    if (!space) {
      throw new NotFoundError("Espacio no encontrado");
    }
    if (space.ownerId !== input.ownerId) {
      throw new ForbiddenError("No eres propietario de este espacio");
    }

    space.toggleActive();
    await this.spaceRepository.save(space);
    return space.toSnapshot();
  }
}
