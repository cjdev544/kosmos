import { randomUUID } from "node:crypto";
import { inject, injectable } from "tsyringe";
import { Space, SpaceProps } from "../../domain/space.entity.js";
import type { CreateSpaceInput, CreateSpaceUseCase as CreateSpaceUseCasePort, SpaceRepository } from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class CreateSpaceUseCase implements CreateSpaceUseCasePort {
  constructor(@inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository) {}

  async execute(input: CreateSpaceInput): Promise<SpaceProps> {
    const existingSpaces = await this.spaceRepository.findAllByOwner(input.ownerId);
    const now = new Date();

    const space = Space.create({
      id: randomUUID(),
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      viewType: input.viewType ?? "LIST",
      isActive: true,
      position: existingSpaces.length,
      ownerId: input.ownerId,
      createdAt: now,
      updatedAt: now,
    });

    await this.spaceRepository.save(space);
    return space.toSnapshot();
  }
}
