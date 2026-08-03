import { inject, injectable } from "tsyringe";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
import { SpaceProps } from "../../domain/space.entity.js";
import type {
  ChangeSpaceColorInput,
  ChangeSpaceColorUseCase as ChangeSpaceColorUseCasePort,
  SpaceRepository,
} from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class ChangeSpaceColorUseCase implements ChangeSpaceColorUseCasePort {
  constructor(@inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository) {}

  async execute(input: ChangeSpaceColorInput): Promise<SpaceProps> {
    const space = await this.spaceRepository.findById(input.spaceId);
    if (!space) {
      throw new NotFoundError("Espacio no encontrado");
    }
    if (space.ownerId !== input.ownerId) {
      throw new ForbiddenError("No eres propietario de este espacio");
    }

    space.changeColor(input.color);
    await this.spaceRepository.save(space);
    return space.toSnapshot();
  }
}
