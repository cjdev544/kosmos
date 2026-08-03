import { inject, injectable } from "tsyringe";
import { ForbiddenError, NotFoundError } from "../../../../shared/domain/errors.js";
import { SpaceProps } from "../../domain/space.entity.js";
import type {
  ChangeSpaceViewInput,
  ChangeSpaceViewUseCase as ChangeSpaceViewUseCasePort,
  SpaceRepository,
} from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class ChangeSpaceViewUseCase implements ChangeSpaceViewUseCasePort {
  constructor(@inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository) {}

  async execute(input: ChangeSpaceViewInput): Promise<SpaceProps> {
    const space = await this.spaceRepository.findById(input.spaceId);
    if (!space) {
      throw new NotFoundError("Espacio no encontrado");
    }
    if (space.ownerId !== input.ownerId) {
      throw new ForbiddenError("No eres propietario de este espacio");
    }

    space.changeViewType(input.viewType);
    await this.spaceRepository.save(space);
    return space.toSnapshot();
  }
}
