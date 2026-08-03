import { randomUUID } from "node:crypto";
import { inject, injectable } from "tsyringe";
import { ValidationError } from "../../../../shared/domain/errors.js";
import { Space, SpaceProps } from "../../domain/space.entity.js";
import { findSpaceTemplate } from "../../domain/space-templates.js";
import type { ApplyTemplateInput, ApplyTemplateUseCase as ApplyTemplateUseCasePort, SpaceRepository } from "../../domain/ports.js";
import { DI_TOKENS } from "../../../../shared/infrastructure/di/tokens.js";

@injectable()
export class ApplyTemplateUseCase implements ApplyTemplateUseCasePort {
  constructor(@inject(DI_TOKENS.SpaceRepository) private readonly spaceRepository: SpaceRepository) {}

  async execute(input: ApplyTemplateInput): Promise<SpaceProps[]> {
    const template = findSpaceTemplate(input.templateId);
    if (!template) {
      throw new ValidationError(`Plantilla inválida: ${input.templateId}`);
    }

    const existingSpaces = await this.spaceRepository.findAllByOwner(input.ownerId);
    const existingNames = new Set(existingSpaces.map((space) => space.toSnapshot().name));
    const newDefinitions = template.spaces.filter((definition) => !existingNames.has(definition.name));
    const now = new Date();

    const spaces = newDefinitions.map((definition, index) =>
      Space.create({
        id: randomUUID(),
        name: definition.name,
        icon: definition.icon,
        color: definition.color,
        viewType: definition.viewType,
        isActive: true,
        position: existingSpaces.length + index,
        ownerId: input.ownerId,
        createdAt: now,
        updatedAt: now,
      }),
    );

    for (const space of spaces) {
      await this.spaceRepository.save(space);
    }

    return spaces.map((space) => space.toSnapshot());
  }
}
