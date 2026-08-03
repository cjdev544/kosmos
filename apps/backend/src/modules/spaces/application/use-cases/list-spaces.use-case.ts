import { inject, injectable } from "tsyringe";
import { SpaceProps } from "../../domain/space.entity.js";
import type { ListSpacesUseCase as ListSpacesUseCasePort, SpaceRepository } from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class ListSpacesUseCase implements ListSpacesUseCasePort {
  constructor(@inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository) {}

  async execute(ownerId: string): Promise<SpaceProps[]> {
    const spaces = await this.spaceRepository.findAllByOwner(ownerId);
    return spaces.map((space) => space.toSnapshot());
  }
}
